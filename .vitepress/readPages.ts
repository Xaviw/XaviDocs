import { globby } from 'globby'
import matter from 'gray-matter'
import { readFile } from 'fs/promises'
import { type DefaultTheme } from 'vitepress'
import { spawn } from 'child_process'

interface ReadOption {
  ignorePath?: string[]
  sidebar?: DefaultTheme.Sidebar
}

export default async function readPages(option: ReadOption = {}) {
  let paths = await getPagePaths(option)
  let pages = await Promise.all(
    paths.map(async (item) => {
      const date = await getGitTimestamp(item)
      const content = await readFile(item, { encoding: 'utf-8' })
      const { data } = matter(content)
      data.date = date
      return {
        frontMatter: data,
        path: item.replace('.md', ''),
      }
    })
  )
  pages.sort((a, b) => {
    return b.frontMatter.date - a.frontMatter.date
  })
  console.log('pages: ', pages)
  return pages
}

async function getPagePaths(option: ReadOption) {
  const patterns: string[] = option.sidebar ? getLink(option.sidebar) : ['**.md']
  return await globby(patterns, {
    ignore: ['node_modules', 'README.md', 'public', '.vitepress', 'components', 'scripts', ...(option.ignorePath || [])],
  })
}

function getLink(sidebar: DefaultTheme.Sidebar): string[] {
  const result: string[] = []
  const regex = /"link":"([^"]*)"/g
  let matches: RegExpExecArray | null
  while ((matches = regex.exec(JSON.stringify(sidebar))) !== null) {
    result.push(`**${matches[1]}.md`)
  }
  return result
}

function getGitTimestamp(file) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['log', '-1', '--pretty="%ci"', file])
    let output = ''
    child.stdout.on('data', (d) => (output += String(d)))
    child.on('close', () => {
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}
