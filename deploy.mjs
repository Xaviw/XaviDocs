#!/usr/bin/env zx

import { cd } from 'zx/core'
import save from './save.mjs'

save()

// 打包
await $`npm run docs:build`
// 跳转
cd(`docs/.vitepress/dist`)
// dist文件夹内初始化git并提交
await $`git init`
await $`git add -A`
await $`git commit -m 'deploy'`
// 替换为自己的git地址
// master为init后默认的本地主分支名，gh-pages为GitHubPages要求的分支名
await $`git push -f git@github.com:Xaviw/XaviDocs.git master:gh-pages`
// 结束脚本
await $`exit 0`
