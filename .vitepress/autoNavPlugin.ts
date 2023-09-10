import type { DefaultTheme, SiteConfig } from 'vitepress'
import type { ViteDevServer, Plugin, UserConfig } from 'vite'
import fs from 'fs-extra'
import { sep, normalize, join } from 'path'
import glob from 'fast-glob'
import matter from 'gray-matter'

interface Options {
  pattern?: string | string[]
  settings?: PluginSettings
  orderBy?: 'createTime' | 'updateTime'
  sort?: 'ascend' | 'descend'
}

interface FileInfo {
  name: string
  isFolder: boolean
  timestamp: number
  navHide?: boolean
  navSort?: number
  navTitle?: string
  collapsed?: boolean
  children: FileInfo[]
}

type PluginSettings = { [key: string]: Pick<FileInfo, 'navHide' | 'navSort' | 'navTitle'> & { collapsed?: boolean } }

export type { Options, FileInfo }

let configPath: string

const cache = new Map<string, Pick<FileInfo, 'navHide' | 'navSort' | 'navTitle'> & { collapsed?: boolean; updateTime: number }>()

export default function autoNavPlugin(options: Options = {}): Plugin {
  return {
    name: 'vite-plugin-vitepress-auto-nav',
    // md 文件增删时，通过修改配置文件修改时间或触发修改操作，实现热更新功能
    configureServer({ watcher }: ViteDevServer) {
      const fsWatcher = watcher.add('*.md')
      fsWatcher.on('all', (event, path, stats) => {
        if (event !== 'change' && !path.includes('.timestamp-')) {
          try {
            fs.utimesSync(configPath, new Date(), new Date())
          } catch (err) {
            console.log('err: ', err)
            fs.closeSync(fs.openSync(configPath, 'w'))
          }
        }
      })
    },
    async config(config) {
      const _config = config as UserConfig & { vitepress: SiteConfig }

      // 从vitepress配置中获取文档根路径与要排除的文档
      const {
        vitepress: {
          userConfig: { srcExclude = [], srcDir = './' },
          site: {
            themeConfig: { nav },
          },
          configPath: $configPath,
        },
      } = _config

      if (!configPath) {
        configPath = $configPath?.match(/(\.vitepress.*)/)?.[1] || ''
        console.log('configPath: ', configPath)
      }

      // 支持手动传入匹配模式或匹配全部
      const pattern = options.pattern || '**/*.md'

      // 读取需要的md文件
      const paths = (
        await glob(pattern, {
          cwd: srcDir,
          ignore: ['**/node_modules/**', '**/dist/**', 'index.md', ...srcExclude],
        })
      )
        .map((path) => normalize(path))
        .sort()

      // 处理文件路径数组为多级序列化数据
      const data = serializationPaths(paths, options, srcDir)

      // 按 navSort > timestamp 排序
      sortSerializedData(data, options.sort)

      // vitepress 中没有配置 nav 时自动生成
      // 因为 nav 数据项较少，用手动配置代替在插件中设置
      if (!nav) {
        _config.vitepress.site.themeConfig.nav = generateNav(data)
      }

      // 生成侧边栏目录
      const sidebar = generateSidebar(data)
      _config.vitepress.site.themeConfig.sidebar = sidebar

      return _config
    },
  }
}

/**
 * 处理文件路径字符串数组
 */
function serializationPaths(paths: string[], { settings, orderBy = 'createTime' }: Options = {}, srcDir: string) {
  // 统一路径格式，便于匹配
  const $settings: PluginSettings = {}
  for (let key in settings) {
    $settings[join(srcDir, key)] = settings[key]
  }

  const pathKeys = Object.keys($settings)

  const root: FileInfo[] = []

  for (let path of paths) {
    // 获取路径中的每一级名称
    const pathParts = join(srcDir, path).split(sep)

    let currentNode = root
    let currentPath = ''

    for (const part of pathParts) {
      currentPath = join(currentPath, part)

      //获取时间戳
      const timeKey = orderBy === 'createTime' ? 'birthtimeMs' : 'ctimeMs'
      const fileStat = fs.statSync(currentPath)
      const timestamp = fileStat[timeKey]
      const updateTime = fileStat.ctimeMs

      // 简单判断是否是文件
      const isFolder = !part.includes('.')

      // 查找是否有自定义配置
      const customInfoKey = pathKeys.find((p) => currentPath === p)
      let customInfo = customInfoKey ? $settings[customInfoKey] : {}

      // 文件读取frontmatter中的配置，优先级高于插件配置
      if (!isFolder) {
        const { updateTime: prevTime, ...prevInfo } = cache.get(currentPath) || {}
        if (updateTime === prevTime) {
          // 如果已经读取过，且文件没有更新
          customInfo = prevInfo
        } else {
          // 没有读取过或已更新，重新读取
          const src = fs.readFileSync(currentPath, 'utf-8')
          const {
            data: { navHide, navTitle, navSort },
          } = matter(src)
          customInfo = { navHide, navTitle, navSort }
          cache.set(currentPath, { ...customInfo, updateTime })
        }
      }

      // 跳过不展示的部分
      if (customInfo.navHide) break

      let childNode = currentNode.find((node) => node.name === part)

      if (!childNode) {
        childNode = { ...customInfo, name: part, isFolder, timestamp, children: [] }
        currentNode.push(childNode)
      }

      currentNode = childNode.children
    }
  }
  return root
}

/**
 * 对序列化后的多级数组数据进行逐级排序
 * 优先按 navSort 排序，其次时间戳排序，navSort 始终优先于时间戳
 */
function sortSerializedData(data: FileInfo[], sort: 'descend' | 'ascend' = 'descend'): FileInfo[] {
  return data
    .sort((a, b) => {
      let flag: number
      if (a.navSort !== undefined && b.navSort !== undefined) {
        flag = b.navSort - a.navSort
      } else if (a.navSort !== undefined) {
        flag = -1
      } else if (b.navSort !== undefined) {
        flag = 1
      } else {
        flag = a.timestamp - b.timestamp
      }
      return sort === 'descend' ? flag : flag * -1
    })
    .map((item) => {
      if (item.children && item.children.length > 0) {
        item.children = sortSerializedData(item.children)
      }
      return item
    })
}

/**
 * 生成 nav 数据
 */
function generateNav(serializedData: FileInfo[]) {
  console.log('serializedData: ', serializedData)
  return serializedData.map((item) => ({
    text: item.navTitle || item.name,
    activeMatch: `/${item.name}/`,
    link: getFirstArticleFromFolder(item),
  }))
}

/**
 * 获取首层目录中第一篇文章
 */
function getFirstArticleFromFolder(data: FileInfo, path = '') {
  path += `/${data.name}`
  if (data.children.length) {
    return getFirstArticleFromFolder(data.children[0], path)
  } else {
    return path
  }
}

/**
 * 生成 sidebar
 */
function generateSidebar(serializedData: FileInfo[]): DefaultTheme.Sidebar {
  const sidebar: DefaultTheme.Sidebar = {}

  for (let { name, children } of serializedData) {
    sidebar[`/${name}/`] = traverseSubFile(children, `/${name}`)
  }

  function traverseSubFile(subData: FileInfo[], parentPath: string): DefaultTheme.SidebarItem[] {
    return subData.map((file) => {
      const filePath = `${parentPath}/${file.name}`
      const fileName = file.navTitle || file.name.replace('.md', '')
      if (file.isFolder) {
        return {
          text: fileName,
          collapsed: file.collapsed ?? false,
          items: traverseSubFile(file.children, filePath),
        }
      } else {
        return { text: fileName, link: filePath.replace('.md', '') }
      }
    })
  }

  return sidebar
}
