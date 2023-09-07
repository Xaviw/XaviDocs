<template>
  <Layout>
    <template #doc-after>
      <div class="beaudar" :style="{ height: beaudarHeight + 'px' }">
        <iframe class="beaudar-frame" title="Comments" scrolling="no"
          src="https://beaudar.lipk.org/beaudar.html?src=https%3A%2F%2Fbeaudar.lipk.org%2Fclient.js&amp;async=&amp;repo=Xaviw%2FXaviDocs&amp;issue-term=pathname&amp;crossorigin=anonymous&amp;label=%F0%9F%92%AC%E8%AF%84%E8%AE%BA&amp;url=http%3A%2F%2Flocalhost%3A5173%2FXaviDocs%2F%25E5%25B7%25A5%25E5%2585%25B7%25E7%25B3%25BB%25E5%2588%2597%2F%25E7%25BC%2596%25E8%25BE%2591%25E5%2599%25A8%2FJSDoc%25E4%25BB%258B%25E7%25BB%258D.html&amp;origin=http%3A%2F%2Flocalhost%3A5173&amp;pathname=XaviDocs%2F%25E5%25B7%25A5%25E5%2585%25B7%25E7%25B3%25BB%25E5%2588%2597%2F%25E7%25BC%2596%25E8%25BE%2591%25E5%2599%25A8%2FJSDoc%25E4%25BB%258B%25E7%25BB%258D&amp;title=JSDoc+%E4%BB%8B%E7%BB%8D+%7C+Xavi%E7%9A%84%E6%8A%80%E6%9C%AF%E6%96%87%E6%A1%A3&amp;description=%E4%B8%AA%E4%BA%BA%E5%89%8D%E7%AB%AF%E6%8A%80%E6%9C%AF%E6%96%87%E6%A1%A3&amp;og%3Atitle=&amp;session=096436a4f69f8dafd7d0d85aCK0DyZ82y5zxgqq1sd13wQKv7yg7ti4syWaCuKjy4CfjMEM8pvN95VuGXIFcYsbwrN0rVd%2FYVzZz0TqbWMyomDaQb%2FtmKfxT8IMuUcpkr3kF7Wgy7ft7xzMqeJY%3D"
          loading="lazy"></iframe>
      </div>
    </template>

    <template #not-found>
      <NotFound />
    </template>
  </Layout>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme'
import { onMounted, ref, watch } from 'vue'
import NotFound from './NotFound.vue';

const { Layout } = DefaultTheme

const { isDark } = useData()

const beaudarHeight = ref(0)

onMounted(() => {
  window.addEventListener('message', (msg) => {
    if (msg.origin !== 'https://beaudar.lipk.org') return
    const { type, height } = msg.data || {}
    if (type === 'resize') {
      beaudarHeight.value = height
      setBeaudarTheme()
    }
  })
})

watch(isDark, setBeaudarTheme)

function setBeaudarTheme() {
  const message = {
    type: 'set-theme',
    theme: isDark.value ? 'github-dark' : 'github-light'
  };
  const beaudarIframe = document.querySelector('iframe');
  beaudarIframe?.contentWindow?.postMessage(message, 'https://beaudar.lipk.org');
}
</script>

<style>
.beaudar {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 24px;
}

.beaudar-frame {
  color-scheme: light;
  position: absolute;
  left: 0;
  right: 0;
  width: 1px;
  min-width: 100%;
  max-width: 100%;
  height: 100%;
  border: 0;
}
</style>
