<template>
  <div class="center">
    <VPButton text="随机阅读" @click="randomPage" style="margin: 0 auto" />
  </div>
</template>

<script setup lang="ts">
import { useData, useRouter } from 'vitepress'
import VPButton from 'vitepress/dist/client/theme-default/components/VPButton.vue'

const data = useData()
const pages = data.theme.value.pages
const router = useRouter()

function randomPage() {
  const path = pages[(pages.length - 1) % (Math.floor(Math.random() * 10) + 1)].path
  console.log('path: ', path);
  router.go(path)
}
</script>

<style>
.center {
  margin-top: -64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
