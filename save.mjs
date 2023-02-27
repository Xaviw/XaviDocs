#!/usr/bin/env zx

import { $ } from 'zx/core'

async function save() {
  await $`git add .`
  await $`git commit -m 'script save'`
  await $`git push`
}

await save()

await $`exit 0`

export default save
