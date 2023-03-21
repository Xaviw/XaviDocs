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
      const path = item.replace('.md', '')
      return {
        frontMatter: data,
        path,
        content: content
          // 只保留最大可能显示范围
          .slice(0, 200)
          // 本文档创作过程中发现不能在config配置中含有`import.meta.env`字样
          // 在向官方提issue后得到回复这并不算一个bug，建议通过\0插入空字符解决
          .replace(/(import)/gi, 'i\0mport')
          .replace(/(export)/gi, 'e\0export')
          // 去除html标签，因为Feature组件内部用的v-html显示
          .replace(/<[^>]+?>/g, '')
          // 去除标题
          .replace(/^#+ [\S]+?\s/gm, '')
          // 去除引用
          .replace(/^\> /gm, '')
          // 只保留反引号内部内容
          .replace(/`(\S+?)`/g, '$1')
          // 只保留跳转内容
          .replace(/\[(\S+?)\]\(\S+?\)/g, '$1')
          // 去除提示块
          .replace(/^:::[\s\S]+?$/gm, '')
          // 去除空白字符
          .replace(/\s/g, ' '),
        title: path.split('/').pop() || path, // 从路径中获取标题
      }
    })
  )
  // 按发布日期降序排列
  pages.sort((a, b) => b.frontMatter.date[0] - a.frontMatter.date[0])
  return pages
}

async function getPagePaths(option: ReadOption) {
  // 如果传入了sidebar，则获取sidebar中所有页面路径传入globby
  // 否则遍历所有md文件
  const patterns: string[] = option.sidebar ? getLink(option.sidebar, option.path) : ['**.md']
  // 忽略无需识别的文件
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
function getGitTimestamp(file: string) {
  return new Promise<[number, number]>((resolve, reject) => {
    // 开启子进程执行git log命令
    const child = spawn('git', ['--no-pager', 'log', '--pretty="%ci"', file])
    let output: string[] = []
    child.stdout.on('data', (d) => {
      const data = String(d).trim()
      data && (output = data.split('\n'))
    })
    child.on('close', () => {
      if (output.length) {
        // 返回[发布时间，最近更新时间]
        resolve([+new Date(output[output.length - 1]), +new Date(output[0])])
      } else {
        // 没有提交记录的文件，返回当前时间
        resolve([+new Date(), +new Date()])
      }
    })
    child.on('error', reject)
  })
}
