import { join } from 'path'
import { readdirSync, statSync, closeSync, openSync, utimesSync } from 'fs'
import { type ViteDevServer } from 'vite'

export interface PluginOption {
  ignoreList?: string[]
  ignoreFlag?: string
}

interface SidebarMulti {
  [path: string]: SidebarItem[]
}

interface SidebarItem {
  text?: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
  _priority?: number
}

export default function generateSidebar(option: PluginOption = {}) {
  return {
    name: 'vite-plugin-vitepress-auto-nav',
    configureServer({ watcher }: ViteDevServer) {
      const fsWatcher = watcher.add('*.md')
      fsWatcher.on('all', (event: string) => {
        // 监听md文件变更，有增删文件时触发刷新
        if (event !== 'change') {
          hotUpdate()
        }
      })
    },
    transform(source: string, id: string) {
      if (/\/@siteData/.test(id)) {
        const docsPath = join(process.cwd(), '/docs')
        // 创建侧边栏对象
        const { sidebar, rewrites } = genSidebarMulti(docsPath, option)
        console.log(rewrites)
        // 插入数据
        const code = injectSidebar(source, sidebar)
        // 返回插入sidebar后的配置文件作为实际代码
        return { code }
      }
    },
  }
}

const reg = /^(\d+)?\.?(\S+?)(\.md)?$/
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

function genSideBarItems(ignoreFlag: string, targetPath: string, ...rest: string[]): { items: SidebarItem[]; rewrites: Record<string, string> } {
  const items: SidebarItem[] = []
  let rewrites: Record<string, string> = {}

  let dirs = readdirSync(join(targetPath, ...rest)).sort(localeSort)

  for (const dir of dirs) {
    // 忽略固定前缀目录或文件
    if (dir.startsWith(ignoreFlag)) continue

    const isDir = statSync(join(targetPath, ...rest, dir)).isDirectory()

    const { rewrites: r1, text } = parseText(dir)

    if (isDir) {
      // 是非空目录
      const { items: i, rewrites: r2 } = genSideBarItems(ignoreFlag, targetPath, ...rest, dir)
      if (i.length) {
        items.push({
          text,
          collapsed: false,
          items: i,
        })
        rewrites = { ...rewrites, ...r1, ...r2 }
      }
    } else {
      // 是页面
      const item: SidebarItem = {
        text,
        link: [...rest.map((item) => parseText(item).text), text].join('/'),
      }
      items.push(item)
    }
  }

  return { items, rewrites }
}

function genSidebarMulti(path: string, options: PluginOption): { sidebar: SidebarMulti; rewrites: Record<string, string> } {
  let { ignoreFlag = '_', ignoreList = [] } = options
  ignoreList = ['.vitepress', 'public', ...ignoreList]
  const data: SidebarMulti = {}
  let rewrites: Record<string, string> = {}
  let dirs = readdirSync(path)
    .filter((n) => statSync(join(path, n)).isDirectory() && !ignoreList.includes(n))
    .sort(localeSort)
  for (const dir of dirs) {
    const { text, rewrites: r1 } = parseText(dir)
    const { items, rewrites: r2 } = genSideBarItems(ignoreFlag, path, dir)
    data[`/${text}/`] = items
    rewrites = { ...rewrites, ...r1, ...r2 }
  }

  return { sidebar: data, rewrites }
}

function insertStr(source: string, start: number, newStr: string) {
  return source.slice(0, start) + newStr + source.slice(start)
}

function injectSidebar(source: string, data: SidebarMulti) {
  const themeConfigPosition = source.indexOf('{', source.indexOf('themeConfig'))
  return insertStr(source, themeConfigPosition + 1, `"sidebar": ${JSON.stringify(data)},`.replace(/"/g, '\\"'))
}

function isNullOrUndef(value: any): boolean {
  return value === null || value === undefined
}

function localeSort(a: string, b: string) {
  return a.localeCompare(b)
}

function parseText(dir: string): { rewrites: Record<string, string>; text: string } {
  let [_, _priority, text]: any[] = reg.exec(dir) || []
  const hasPriority = !isNullOrUndef(_priority)
  const originText = (hasPriority ? _priority + '.' : '') + text
  let rewrites = hasPriority ? { [`/${text}/*`]: `/${originText}/*` } : {}
  return {
    rewrites,
    text,
  }
}
