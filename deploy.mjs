#!/usr/bin/env zx

import { $, cd } from 'zx/core'

// 自动提交，忽略例如没有变更等错误
try {
  await $`git add .`
  await $`git commit -m 'script save'`
  await $`git push`
} catch (error) { }

// 打包
await $`npm run build`

// 跳转
cd(`docs/.vitepress/dist`)

// dist文件夹内初始化git并提交
await $`git init`
await $`git add -A`
await $`git commit -m 'deploy'`
// 替换为自己的git地址
// master为init后默认的本地主分支名，gh-pages为GitHubPages要求的分支名
await $`git push -f git@github.com:Xaviw/XaviDocs.git master:gh-pages`

// 0为”成功退出码“，不写这句会返回“失败退出码”1
await $`exit 0`
