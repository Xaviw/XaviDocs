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
  let paths = await getPagePaths(option)
  let pages = await Promise.all(
    paths.map(async (item) => {
      const date = await getGitTimestamp(item)
      const file = await readFile(item, { encoding: 'utf-8' })
      const { data, content } = matter(file)
      data.date = date
      const path = item.replace('.md', '');
      return {
        frontMatter: data,
        path,
        content,
        title: path.split('/').pop() || path,
      }
    })
  )
  pages.sort((a, b) => {
    return b.frontMatter.date - a.frontMatter.date
  })
  return pages
}

async function getPagePaths(option: ReadOption) {
  const patterns: string[] = option.sidebar ? getLink(option.sidebar, option.path) : ['**.md']
  return await globby(patterns, {
    ignore: ['node_modules', 'README.md', 'public', '.vitepress', 'components', 'scripts', ...(option.ignorePath || [])],
  })
}

function getLink(sidebar: DefaultTheme.Sidebar, path: string = '/docs'): string[] {
  const result: string[] = []
  const regex = /"link":"([^"]*)"/g
  let matches: RegExpExecArray | null
  while ((matches = regex.exec(JSON.stringify(sidebar))) !== null) {
    result.push(`${path}/${matches[1]}.md`)
  }
  return result
}

export function getGitTimestamp(file: string) {
  return new Promise<[number, number]>((resolve, reject) => {
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
