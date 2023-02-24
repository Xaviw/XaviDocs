#!/usr/bin/env zx

async function save() {
  await $`git add .`
  await $`git commit -m 'script save'`
  await $`git push`
}

await save()

// 结束脚本
await $`exit 0`
