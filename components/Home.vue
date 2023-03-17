<template>
  <VPHero name="XaviDocs" text="个人技术文档" :tagline="tagline" :image="image" :actions="actions" />
  <VPFeatures :features="features" />
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import { onUnmounted, ref, onMounted } from 'vue'
import { useData } from 'vitepress'
import VPHero from 'vitepress/dist/client/theme-default/components/VPHero.vue'
import VPFeatures, { type Feature } from 'vitepress/dist/client/theme-default/components/VPFeatures.vue'
import 'dayjs/locale/zh-cn'
import { type Pages } from '../.vitepress/readPages'

dayjs.locale('zh-cn')
dayjs.extend(duration)
dayjs.extend(relativeTime)

const data = useData()
const pages: Pages[] = data.theme.value.pages
const firstCommit: number = data.theme.value.firstCommit

const tagline = ref()
const image = { light: 'svg/pic1.svg', dark: 'svg/pic2.svg' }
const actions = ref([
  {
    text: '随便逛逛',
    link: randomPage(),
  },
])

onMounted(() => {
  const timer = setInterval(update(), 1000)
  onUnmounted(clearInterval.bind(null, timer))
})

const features = ref<Feature[]>(
  pages.map((item) => {
    let regTitle = item.content.match(/^# (\S+?)\s*$/m)?.[1]
    const matterTitle = regTitle?.match(/\{\{\$frontmatter\.(\S+)\}\}/)?.[1]
    if (matterTitle) {
      regTitle = item.frontMatter[matterTitle]
    }
    return {
      title: regTitle || item.title,
      details: item.content
        .slice(0, 200)
        .replace(/^#+ [\S]+?\s/gm, '')
        .replace(/^\> /gm, '')
        .replace(/`(\S+?)`/g, '$1')
        .replace(/\[(\S+?)\]\(\S+?\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/^:::[\s\S]+?$/gm, '')
        .replace(/\s/g, ' '),
      link: item.path,
      linkText: dayjs(item.frontMatter.date[item.frontMatter.date.length - 1]).format('YYYY-MM-DD'),
    }
  })
)

function randomPage(): string {
  const length = pages.length - 1
  return pages[Math.floor(Math.random() * length)].path
}

function update() {
  const diff = dayjs().diff(dayjs(firstCommit))
  const diffDays = dayjs.duration(diff).days()
  const diffHours = dayjs.duration(diff).hours()
  const diffMinutes = dayjs.duration(diff).minutes()
  const diffSeconds = dayjs.duration(diff).seconds()
  tagline.value = `过去的${diffDays || ''}天${diffHours || ''}时${diffMinutes < 10 ? `0${diffMinutes}` : diffMinutes}分${diffSeconds < 10 ? `0${diffSeconds}` : diffSeconds}秒中，累计更新${
    pages.length
  }篇文章`
  return update
}
</script>

<style scoped>
:deep(.details) {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}
</style>
