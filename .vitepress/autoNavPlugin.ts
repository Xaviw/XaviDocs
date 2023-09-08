import type { DefaultTheme, SiteConfig, Theme } from 'vitepress'
import type { ViteDevServer, Plugin, UserConfig } from 'vite'
import fs from 'fs-extra'
import { sep, normalize, join } from 'path'
import glob from 'fast-glob'
import matter from 'gray-matter'

/**
 * @file 自动生成nav和sidebar的vite插件
 * 1.读取文档目录，按一级目录生成nav
 * 2.读取次级目录，依次生成sidebar
 * 3.跳过空目录，以及需要忽略的目录
 * 4.文档可以在frontmatter中定义是否展示（默认展示）、排序值（默认创建时间排序）
 * 5.配置中可以传入文件夹排序
 */
/**
 * 是否展示：navShow
 * 排序权重：navSort
 * 展示名称：navTitle
 */

interface PluginOption {
  pattern?: string | string[]
  options?: FolderOptions
}

interface FileInfo {
  name: string
  isFolder: boolean
  timestamp: number
  navShow?: boolean
  navSort?: number
  navTitle?: string
  collapsed?: boolean
  children: FileInfo[]
}

type FolderOptions = { [key: string]: Pick<FileInfo, 'navShow' | 'navSort' | 'navTitle'> } & { collapsed?: boolean }

export type { PluginOption, FileInfo }

const cache = new Map<
  string,
  {
    frontmatter: any
    timestamp: number
  }
>()

export default function autoNavPlugin(options: PluginOption = {}): Plugin {
  return {
    name: 'vite-plugin-vitepress-auto-nav',
    configureServer({ watcher, restart }: ViteDevServer) {
      const fsWatcher = watcher.add('*.md')
      fsWatcher.on('all', (event: string) => {
        // 监听md文件变更，有增删文件时触发刷新
        if (event !== 'change') {
          restart()
        }
      })
    },
    async config(config) {
      let _config = config as UserConfig & { vitepress: SiteConfig }
      const {
        vitepress: {
          userConfig: { srcExclude = [], srcDir = '/' },
          site: {
            themeConfig: { nav },
          },
        },
      } = _config

      const pattern = options.pattern || srcExclude.map((item) => `!${item}`) || '*.md'

      // 读取需要的md文件，并按字符unicode排序
      const paths = (
        await glob(pattern, {
          ignore: ['**/node_modules/**', '**/dist/**'],
        })
      ).sort()

      let data = convertPaths(paths)
      sortData(data)
      if (!nav) {
        _config.vitepress.site.themeConfig.nav = generateNav(data)
      }
      const sidebar = generateSidebar(data)
      console.log(JSON.stringify(sidebar))

      return _config
    },
  }
}

function convertPaths(paths: string[], options: FolderOptions = {}) {
  const optionsKeys = Object.keys(options)
  const root: FileInfo[] = []
  for (let path of paths) {
    const pathParts = normalize(path).split(sep)

    let currentNode = root
    let currentPath = '.'

    for (const part of pathParts) {
      currentPath += '/' + part
      const timestamp = fs.statSync(currentPath).birthtimeMs
      const isFolder = !part.includes('.')
      const customInfoKey = optionsKeys.find((p) => isPathMatchPattern(currentPath, p))
      let customInfo = customInfoKey ? options[customInfoKey] : {}

      if (!isFolder) {
        const src = fs.readFileSync(currentPath, 'utf-8')
        const {
          data: { navShow, navTitle, navSort },
        } = matter(src)
        customInfo = { navShow, navTitle, navSort }
      }

      if (customInfo.navShow === false) continue

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

function isPathMatchPattern(path: string, pattern: string): boolean {
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
  return regex.test(path)
}

function sortData(data: FileInfo[]): FileInfo[] {
  return data
    .sort((a, b) => {
      if (a.navSort !== undefined && b.navSort !== undefined) {
        // Sort by navSort in descending order
        return b.navSort - a.navSort
      } else if (a.navSort !== undefined) {
        // a has navSort, so it should come before b
        return -1
      } else if (b.navSort !== undefined) {
        // b has navSort, so it should come before a
        return 1
      } else {
        // Sort by timestamp in ascending order
        return a.timestamp - b.timestamp
      }
    })
    .map((item) => {
      if (item.children && item.children.length > 0) {
        item.children = sortData(item.children)
      }
      return item
    })
}

function generateNav(data: FileInfo[]) {
  return data.map((item) => ({
    text: item.navTitle || item.name,
    activeMatch: `/${item.name}/`,
    link: getFirstArticle(item),
  }))
}

function getFirstArticle(data: FileInfo, path = '') {
  path += `/${data.name}`
  if (data.children.length) {
    return getFirstArticle(data.children[0], path)
  } else {
    return path
  }
}

function generateSidebar(data: FileInfo[]): DefaultTheme.Sidebar {
  const result: DefaultTheme.Sidebar = {}

  for (let item of data) {
    result[`/${item.navTitle || item.name}/`] = traverseData(item.children, `/${item.navTitle || item.name}`)
  }

  function traverseData(items: FileInfo[], path: string): DefaultTheme.SidebarItem[] {
    return items.map((item) => {
      const folderPath = `${path}/${item.name}`
      const folder: DefaultTheme.SidebarItem = {
        text: item.navTitle || item.name,
        collapsed: item.collapsed ?? false,
        items: [],
      }

      if (item.isFolder) {
        const subFolders = traverseData(item.children, folderPath)
        folder.items = subFolders
      } else {
        const fileName = item.name.replace('.md', '')
        const fileLink = `${folderPath}/${fileName}`
        folder.items!.push({ text: fileName, link: fileLink })
      }

      return folder
    })
  }

  return result
}
