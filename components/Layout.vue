<template>
  <Layout>
    <template #doc-after>
      <div id="beaudar" style="margin-top: 24px"></div>
    </template>

    <template #not-found>
      <NotFound />
    </template>
  </Layout>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme'
import { nextTick, onMounted, watch, watchEffect } from 'vue'
import NotFound from './NotFound.vue';

const { Layout } = DefaultTheme

const { page } = useData()

onMounted(() => {
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://beaudar.lipk.org/client.js'
  script.setAttribute('repo', 'Xaviw/XaviDocs')
  script.setAttribute('issue-term', 'pathname')
  script.setAttribute('crossorigin', 'anonymous')
  script.setAttribute('label', '💬评论')
  if (window.localStorage.getItem('mode') === 'night') {
    script.setAttribute('theme', 'github-dark')
    window.localStorage.setItem('beaudar-theme', 'github-dark')
  } else {
    script.setAttribute('theme', 'github-light')
    window.localStorage.setItem('beaudar-theme', 'github-light')
  }


  watchEffect(() => {
    if (page.value?.relativePath !== 'index.md') {
      nextTick(() => {
        const beaudar = document.getElementById('beaudar')
        beaudar?.appendChild(script)
      })
    }
  })
})
</script>
