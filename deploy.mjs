#!/usr/bin/env zx

import { $, cd } from 'zx/core'
import save from './save.mjs'

// 打包
await $`npm run build`
// 跳转
cd(`docs/.vitepress/dist`)
