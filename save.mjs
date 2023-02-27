#!/usr/bin/env zx

import { $ } from 'zx/core'

await $`git add .`
await $`git commit -m 'script save'`
await $`git push`
await $`exit 0`
