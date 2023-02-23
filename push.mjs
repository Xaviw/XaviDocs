#!/usr/bin/env zx

await $`git init`
await $`git add -A`
await $`git commit -m 'script save'`
await $`git push`
