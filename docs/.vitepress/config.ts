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
        text: '前端系列',
        activeMatch: '/frontend/',
        link: '/frontend/sourceCode/axios',
      },
      {
        text: '工具系列',
        activeMatch: '/tools/',
        link: '/tools/recommend/windows',
      },
      // {
      //   text: '文档搭建',
      //   activeMatch: '/vitepress/',
      //   link: '/vitepress/start',
      // },
    ],
    sidebar: {
      '/frontend/': [
        {
          text: '源码系列',
          items: [{ text: 'Axios', link: '/frontend/sourceCode/axios' }],
        },
        {
          text: 'UniApp',
          items: [{ text: 'uniapp对比原生小程序', link: '/frontend/uniapp/intro' }],
        },
      ],
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
            { text: '基础搭建', link: '/vitepress/start' },
            { text: '进阶语法', link: '/vitepress/syntax' },
            { text: '常用配置', link: '/vitepress/config' },
          ],
        },
      ],
    },
    outline: [1, 3],
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
    // algolia: {
    //   appId: 'S3XDRVMGC4',
    //   apiKey: '7c58a765cccb1868ed4cdbce97b9ad6f',
    //   indexName: 'XaviDocs',
    //   placeholder: '请输入关键词',
    //   buttonText: '搜索',
    // },
  },
  markdown: {
    lineNumbers: true,
  },
})
