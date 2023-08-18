import { createContentLoader } from 'vitepress'
import path from 'path'
import { spawn } from 'child_process'

// 避免导入时报错
let data
export { data }

export default createContentLoader('/!(.vitepress|public|node_modules|.guthub|components|snippets)/**/*.md', {
  includeSrc: true,
  async transform(data) {
    const promises: Promise<any>[] = []

    data.forEach((item) => {
      // 用页面的一级标题作为文章标题（因为sidebar中可能是精简的标题）
      let title = item.src?.match(/^#([\s\S]*?)[\n\r]*$/m)?.[1] || path.basename(item.url).replace(path.extname(item.url), '')
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
        .slice(1)
        .join(path.sep)

      // 获取发布时间
      const task = getGitTimestamp(link.replace(/\.html$/i, '.md')).then((createdTime) => {
        return {
          title,
          details: item.src
            // 去除html标签
            ?.replace(/<[^>]+?>/g, '')
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
          // 显示发布时间
          linkText: new Date(createdTime[0]).toLocaleDateString(),
          createdTime: createdTime[0],
        }
      })

      promises.push(task)
    })

    const pages = await Promise.all(promises)
    // 发布时间降序排列
    return pages.sort((a, b) => b.createdTime - a.createdTime)
  },
})

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
    child.on('error', () => {
      // 获取失败时使用当前时间，避免构建错误
      resolve([+new Date(), +new Date()])
    })
  })
}
