<template>
  <VPHero name="XaviDocs" text="个人技术文档" :image="image" :actions="actions" />
  <VPFeatures :features="pages" />
</template>

<script setup lang="ts">
import VPHero from 'vitepress/dist/client/theme-default/components/VPHero.vue'
import VPFeatures from 'vitepress/dist/client/theme-default/components/VPFeatures.vue'
import { data as pages } from '../.vitepress/create.data'

const tagline = `累计更新${pages.length}篇文章`
const image = { light: '/pic1.svg', dark: '/pic2.svg' }
const actions = [
  {
    text: '随便逛逛',
    link: randomPage(),
  },
]

function randomPage(): string {
  const length = pages.length - 1
  return pages[Math.floor(Math.random() * length)]!.link!
}
</script>

<style>
.details {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.vp-doc h2 {
  margin: 0;
  border: none;
  padding: 0;
}
</style>
