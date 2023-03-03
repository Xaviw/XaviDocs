import { globby } from 'globby'
import matter from 'gray-matter'
import { readFile } from 'fs/promises'
import { type DefaultTheme } from 'vitepress'
import { spawn } from 'child_process'

interface ReadOption {
  ignorePath?: string[]
  sidebar?: DefaultTheme.Sidebar
  path?: string
}

export interface Pages {
  frontMatter: Record<string, any>
  path: string
  content: string
  title: string
}

export default async function readPages(option: ReadOption = {}): Promise<Pages[]> {
  // 获取需要的页面路径
  let paths = await getPagePaths(option)
  let pages = await Promise.all(
    // 循环获取页面信息
    paths.map(async (item) => {
      // 获取首次提交和最后提交时间
      const date = await getGitTimestamp(item)
      // 读取并解析页面内容
      const file = await readFile(item, { encoding: 'utf-8' })
      const { data, content } = matter(file)
      data.date = date
      const path = item.replace('.md', '');
      return {
        frontMatter: data,
        path,
        content,
        title: path.split('/').pop() || path, // 从路径中获取标题
      }
    })
  )
  // 按日期降序排列
  pages.sort((a, b) => {
    return b.frontMatter.date - a.frontMatter.date
  })
  return pages
}

async function getPagePaths(option: ReadOption) {
  // 如果传入了sidebar，则获取sidebar中所有页面路径传入globby
  // 否则遍历所有md文件
  const patterns: string[] = option.sidebar ? getLink(option.sidebar, option.path) : ['**.md']
  return await globby(patterns, {
    ignore: ['node_modules', 'README.md', 'public', '.vitepress', 'components', 'scripts', ...(option.ignorePath || [])],
  })
}

// 使用正则提取sidebar中所有页面链接
function getLink(sidebar: DefaultTheme.Sidebar, path: string = '/docs'): string[] {
  const result: string[] = []
  const regex = /"link":"([^"]*)"/g
  let matches: RegExpExecArray | null
  while ((matches = regex.exec(JSON.stringify(sidebar))) !== null) {
    result.push(`${path}/${matches[1]}.md`)
  }
  return result
}

// 获取文件提交时间
export function getGitTimestamp(file: string) {
  return new Promise<[number, number]>((resolve, reject) => {
    // 开启子进程执行git log命令
    const child = spawn('git', ['--no-pager', 'log', '--pretty="%ci"', file])
    let output: string[] = []
    child.stdout.on('data', (d) => {
      output.push(...String(d).trim().split('\n'))
    })
    child.on('close', () => {
      resolve([+new Date(output[0]), +new Date(output[output.length - 1])])
    })
    child.on('error', reject)
  })
}
