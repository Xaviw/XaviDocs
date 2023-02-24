#!/usr/bin/env zx

async function save() {
  await $`git add .`
  await $`git commit -m 'script save'`
  await $`git push`
}

save()
