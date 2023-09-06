import { createContentLoader, DefaultTheme } from 'vitepress'
import path from 'path'
import { spawn } from 'child_process'
import config from './config'
import sidebar from './sidebar'

// 避免导入时报错
let data
export { data }

// 默认匹配所有可用文档
const defaultPattern = config.srcExclude?.map((item) => `!${item}`) || '*.md'
// 有sidebar数据则只需要匹配sidebar中存储的文档
const sidebarPattern = getUrls(sidebar)

// 获取并处理所有文档数据，供首页等使用
// createContentLoader会默认忽略'**/node_modules/**', '**/dist/**'
export default createContentLoader(sidebarPattern || defaultPattern, {
  includeSrc: true,
  async transform(data) {
    const promises: Promise<any>[] = []

    data.forEach((item) => {
      // 用页面的一级标题作为文章标题（因为sidebar中可能是精简的标题）
      let title = item.src?.match(/^#\s+(.*?)\s*$/m)?.[1] || path.basename(item.url).replace(path.extname(item.url), '')
      // 标题可能用到了变量，需要替换
      const matterTitle = title?.match(/\{\{\$frontmatter\.(\S+)\}\}/)?.[1]
      if (matterTitle) {
        title = item.frontmatter[matterTitle]
      }

      // 链接去掉项目名
      const link = path
        .normalize(item.url)
        .split(path.sep)
        .filter((item) => item)
        .join(path.sep)

      // 获取发布时间
      const task = getGitTimestamp(link.replace(/\.html$/i, '.md')).then((fileTimeInfo) => ({
        title,
        details: item.src
          // 去除html标签
          ?.replace(/<[^>]+?>/g, '')
          // 去除frontmatter
          ?.replace(/^---[\s\S]*?---/, '')
          // 去除标题
          .replace(/^#+ [\S]+?\s/gm, '')
          // 去除引用
          .replace(/^\> /gm, '')
          // 只保留反引号内部内容
          .replace(/`(\S+?)`/g, '$1')
          // 只保留加粗、倾斜符号中的内容
          .replace(/\*{1,3}(\S+?)\*{1,3}/g, '$1')
          // 只保留跳转内容
          .replace(/\[(\S+?)\]\(\S+?\)/g, '$1')
          // 去除提示块
          .replace(/^:::[\s\S]+?$/gm, '')
          // 去除空白字符
          .replace(/\s/g, ' '),
        link,
        // 显示更新时间
        linkText: new Date(fileTimeInfo[1]).toLocaleDateString(),
        updateTime: fileTimeInfo[1],
      }))

      promises.push(task)
    })

    // 发布时间降序排列
    const pages = await Promise.all(promises)
    return pages.sort((a, b) => b.updateTime - a.updateTime)
  },
})

// 获取文件提交时间
function getGitTimestamp(file: string) {
  return new Promise<[number, number]>((resolve) => {
    let output: number[] = []

    // 开启子进程执行git log命令
    const child = spawn('git', ['--no-pager', 'log', '--pretty="%ci"', file])

    // 监听输出流
    child.stdout.on('data', (d) => {
      const data = String(d)
        .split('\n')
        .map((item) => +new Date(item))
        .filter((item) => item)
      output.push(...data)
    })

    // 输出接受后返回
    child.on('close', () => {
      if (output.length) {
        // 返回[发布时间，最近更新时间]
        resolve([+new Date(output[output.length - 1]), +new Date(output[0])])
      } else {
        // 没有提交记录的文件，返回当前时间
        resolve([+new Date(), +new Date()])
      }
    })

    child.on('error', () => {
      // 获取失败时使用当前时间，避免构建错误
      resolve([+new Date(), +new Date()])
    })
  })
}

// 使用正则提取sidebar中所有页面链接
function getUrls(sidebar: DefaultTheme.Sidebar): string[] {
  const result: string[] = []
  const regex = /"link":"([^"]*)"/g
  let matches: RegExpExecArray | null
  while ((matches = regex.exec(JSON.stringify(sidebar))) !== null) {
    result.push(path.normalize(`${matches[1]}.md`))
  }
  return result
}
