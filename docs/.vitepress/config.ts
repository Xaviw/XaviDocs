import { defineConfig } from 'vitepress'
import juejin from '../public/svg/juejin'

export default defineConfig({
  lang: 'zh-cmn-Hans',
  title: 'Xavi的技术文档',
  description: '个人前端技术文档',
  base: '/XaviDocs/',
  lastUpdated: true,
  // outDir: '/dist',
  themeConfig: {
    // logo: '/xavi-logo.svg',
    // siteTitle:'',
    nav: [
      {
        text: '工具系列',
        link: '/tools/recommend/windows',
      },
      {
        text: '文档搭建',
        link: '/vitepress/start',
      },
    ],
    sidebar: {
      '/tools/': [
        {
          text: '实用工具',
          items: [
            { text: 'Windows工具', link: '/tools/recommend/windows' },
            { text: '浏览器工具', link: '/tools/recommend/browser' },
          ],
        },
        {
          text: '编辑器',
          collapsible: true,
          items: [
            { text: 'VSCode设置', link: '/tools/editor/vscode-setting' },
            { text: 'VSCode插件推荐', link: '/tools/editor/vscode-extension' },
            { text: '实用语法-JSDoc、Emmet', link: '/tools/editor/jsdoc-emmet' },
          ],
        },
      ],
      '/vitepress/': [
        {
          text: 'Vitepress搭建',
          collapsible: true,
          items: [
            { text: '起步', link: '/vitepress/start' },
            { text: '特有md语法', link: '/vitepress/syntax' },
            { text: '常用配置', link: '/vitepress/config' },
          ],
        },
      ],
    },
    // outline: 2,
    outlineTitle: '目录',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Xaviw' },
      {
        icon: { svg: juejin },
        link: 'https://juejin.cn/user/3192637500426840',
      },
    ],
    // footer: {}, // footer不会与sidebar共存
    editLink: {
      pattern: 'https://github.com/Xaviw/XaviDocs/edit/master/docs/:path',
      text: '修改本文',
    },
    lastUpdatedText: '更新时间',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    algolia: {
      appId: 'RLQAJPQZRF',
      apiKey: '057d79f4e978afb00f30aa041ac38324',
      indexName: 'xaviDocs',
      placeholder: '请输入关键词',
      buttonText: '搜索',
    },
  },
  markdown: {
    lineNumbers: true,
  },
})
