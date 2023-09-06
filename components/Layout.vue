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
import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'
import NotFound from './NotFound.vue';

const { Layout } = DefaultTheme

onMounted(() => {
  const script = document.createElement('script')
  const beaudar = document.getElementById('beaudar')
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
  script.async = true
  beaudar?.appendChild(script)
  console.log(script);
  
})
</script>
