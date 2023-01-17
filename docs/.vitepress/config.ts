import { defineConfig } from 'vitepress';
import juejin from '../public/juejin';

export default defineConfig({
  lang: 'zh-cmn-Hans',
  title: 'Xavi的前端博客',
  description: '个人前端技术博客',
  // base: '/',
  lastUpdated: true,
  outDir: '/dist',
  themeConfig: {
    // logo: '/xavi-logo.svg',
    // siteTitle:'',
    // nav: [],
    sidebar: [
      {
        text: 'Vitepress',
        collapsible: true,
        items: [{ text: 'vitepress扩展md语法', link: '/vitepress/syntax' }],
      },
    ],
    // outline: 2,
    outlineTitle: '大纲',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Xaviw' },
      {
        icon: { svg: juejin },
        link: 'https://juejin.cn/user/3192637500426840',
      },
    ],
    // footer: {}, // footer不会与sidebar共存
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: '修改本文',
    },
    lastUpdatedText: '更新时间',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
  },
  markdown: {
    lineNumbers: true,
  },
});
