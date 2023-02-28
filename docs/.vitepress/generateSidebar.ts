import { join } from 'path'
import { readdirSync, statSync, closeSync, openSync, utimesSync } from 'fs'
import { type DefaultTheme } from 'vitepress'
import { type ViteDevServer } from 'vite'

export interface SidebarPluginOptionType {
  ignoreList?: string[]
  path?: string
}

export default function generateSidebar(option: SidebarPluginOptionType = {}) {
  return {
    name: 'generateSidebar',
    configureServer({ watcher }: ViteDevServer) {
      const fsWatcher = watcher.add('*.md')
      fsWatcher.on('all', (event, path) => {
        // 监听md文件变更，有增删文件时触发刷新
        if (event !== 'change') {
          hotUpdate()
        }
      })
    },
    transform(source: string, id: string) {
      // @siteData也就是项目配置文件
      if (/\/@siteData/.test(id)) {
        const { ignoreList = [], path = '/docs' } = option
        // 忽略扫描的文件夹
        const ignoreFolder = ['public', '.vitepress', ...ignoreList]
        const docsPath = join(process.cwd(), path)
        // 创建侧边栏对象
        const data = genSidebarMulti(docsPath, ignoreFolder)
        // 插入数据
        const code = injectSidebar(source, data)
        // 返回插入sidebar后的配置文件作为实际代码
        return { code }
      }
    },
  }
}

const configFile = join(process.cwd(), 'docs/.vitepress/config.ts')

function hotUpdate() {
  const time = new Date()
  // 通过修改配置文件修改时间或触发修改操作，使Vite刷新
  // 刷新后会重新运行生成操作，实现热更新功能
  try {
    utimesSync(configFile, time, time)
  } catch (err) {
    closeSync(openSync(configFile, 'w'))
  }
}

function genSideBarItems(targetPath: string, ...rest: string[]): DefaultTheme.SidebarItem[] {
  let dirs = readdirSync(join(targetPath, ...rest))
  const result: DefaultTheme.SidebarItem[] = []
  for (const dir of dirs) {
    if (dir.startsWith('_')) continue
    if (statSync(join(targetPath, ...rest, dir)).isDirectory()) {
      // 是目录且有页面
      const items = genSideBarItems(join(targetPath), ...rest, dir)
      items.length &&
        result.push({
          text: dir,
          collapsed: false,
          items,
        })
    } else {
      // 是页面
      const text = dir.replace(/\.md$/, '')
      const item: DefaultTheme.SidebarItem = {
        text,
        link: [...rest, text].join('/'),
      }
      result.push(item)
    }
  }
  return result
}

function genSidebarMulti(path: string, ignoreList: string[] = []): DefaultTheme.SidebarMulti {
  const data: DefaultTheme.SidebarMulti = {}
  let dirs = readdirSync(path).filter((n) => statSync(join(path, n)).isDirectory() && !ignoreList.includes(n))
  for (const dir of dirs) {
    data[`/${dir}/`] = genSideBarItems(path, dir)
  }

  return data
}

function insertStr(source: string, start: number, newStr: string) {
  return source.slice(0, start) + newStr + source.slice(start)
}

function injectSidebar(source: string, data: DefaultTheme.SidebarMulti | DefaultTheme.Sidebar) {
  const themeConfigPosition = source.indexOf('{', source.indexOf('themeConfig'))
  return insertStr(source, themeConfigPosition + 1, `"sidebar": ${JSON.stringify(data)},`.replace(/"/g, '\\"'))
}
