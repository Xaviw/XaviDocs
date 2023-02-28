import { join } from 'path'
import { readdirSync, statSync, closeSync, openSync, utimesSync } from 'fs'
import { type DefaultTheme } from 'vitepress'
import { type ViteDevServer } from 'vite'

const configFile = join(process.cwd(), 'docs/.vitepress/config.ts')

function touch() {
  const time = new Date()

  try {
    utimesSync(configFile, time, time)
  } catch (err) {
    closeSync(openSync(configFile, 'w'))
  }
}
 
function createSideBarItems(targetPath: string, ...rest: string[]): DefaultTheme.SidebarItem[] {
  let dirs = readdirSync(join(targetPath, ...rest))
  const result: DefaultTheme.SidebarItem[] = []
  for (const dir of dirs) {
    if (statSync(join(targetPath, ...rest, dir)).isDirectory()) {
      // 是目录
      result.push({
        text: dir,
        items: createSideBarItems(join(targetPath), ...rest, dir),
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

function createSideBarGroups(targetPath: string, folder: string): DefaultTheme.Sidebar {
  return [
    {
      items: createSideBarItems(targetPath, folder),
    },
  ]
}

function createSidebarMulti(path: string, ignoreList: string[] = []): DefaultTheme.SidebarMulti {
  const data: DefaultTheme.SidebarMulti = {}
  let node = readdirSync(path).filter((n) => statSync(join(path, n)).isDirectory() && !ignoreList.includes(n))
  for (const k of node) {
    data[`/${k}/`] = createSideBarGroups(path, k) as DefaultTheme.SidebarItem[]
  }

  return data
}

function insertStr(source: string, start: number, newStr: string) {
  return source.slice(0, start) + newStr + source.slice(start)
}

function injectSidebar(source: string, data: DefaultTheme.SidebarMulti | DefaultTheme.Sidebar) {
  const themeConfigPosition = source.indexOf('{', source.indexOf('themeConfig'))
  return insertStr(source, themeConfigPosition + 1, `"sidebar": ${JSON.stringify(data)}${source[themeConfigPosition + 1] !== '}' ? ',' : ''}`.replace(/"/g, '\\"'))
}

export interface SidebarPluginOptionType {
  ignoreList?: string[]
  path?: string
}

export default function VitePluginVitepressAutoSidebar(option: SidebarPluginOptionType = {}) {
  return {
    name: 'generateSidebar',
    configureServer({ watcher }: ViteDevServer) {
      const fsWatcher = watcher.add('*.md')
      fsWatcher.on('all', (event, path) => {
        if (event !== 'change') {
          touch()
          console.log(`${event} ${path}`)
          console.log('update sidebar...')
        }
      })
    },
    transform(source: string, id: string) {
      if (/\/@siteData/.test(id)) {
        const { ignoreList = [], path = '/docs' } = option
        // 忽略扫描的文件
        const ignoreFolder = ['scripts', 'components', 'assets', '.vitepress', ...ignoreList]
        const docsPath = join(process.cwd(), path)
        // 创建侧边栏对象
        const data = createSidebarMulti(docsPath, ignoreFolder)
        // 插入数据
        const code = injectSidebar(source, data)
        console.log('injected sidebar data successfully')
        return { code }
      }
    },
  }
}
