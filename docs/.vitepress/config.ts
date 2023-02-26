import { defineConfig } from 'vitepress'
import juejin from '../public/svg/juejin'

export default defineConfig({
  lang: 'zh-cmn-Hans',
  title: 'Xavi的技术文档',
  titleTemplate: false,
  description: '个人前端技术文档',
  base: '/XaviDocs/',
  lastUpdated: true,
  // outDir: '/dist',
  locales: { a: { lang: 'zh' }, b: { lang: 'en' } },
  head: [
    ['test', { a: 'a' }],
    ['test2', { a: 'a' }, 'b'],
  ],
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
        link: '/tools/vitepress/start',
      },
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
          text: 'Vitepress搭建',
          collapsible: true,
          items: [
            { text: '基础搭建', link: '/tools/vitepress/start' },
            { text: '进阶语法', link: '/tools/vitepress/syntax' },
            { text: '配置解析', link: '/tools/vitepress/config' },
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
        {
          text: '实用工具',
          collapsible: true,
          items: [
            { text: 'Windows工具', link: '/tools/recommend/windows' },
            { text: '浏览器工具', link: '/tools/recommend/browser' },
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
    attrs: {
      leftDelimiter: '<',
      rightDelimiter: '>',
      allowedAttributes: [],
      disable: false
    }
  },
})
