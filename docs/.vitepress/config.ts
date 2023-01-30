import { defineConfig } from 'vitepress';
import juejin from '../public/juejin';

export default defineConfig({
  lang: 'zh-cmn-Hans',
  title: 'Xavi的技术文档',
  description: '个人前端技术文档',
  // base: '/',
  lastUpdated: true,
  outDir: '/dist',
  themeConfig: {
    // logo: '/xavi-logo.svg',
    // siteTitle:'',
    // nav: [],
    sidebar: [
      {
        text: '开发工具',
        collapsible: true,
        items: [
          { text: 'VSCode设置', link: '/tools/vscode-setting' },
          { text: 'VSCode插件推荐', link: '/tools/vscode-extension' },
          { text: '实用语法-JSDoc\Emmet', link: '/tools/jsdoc-emmet' },
          { text: '生产力工具', link: '/tools/tools' },
        ],
      },
      // {
      //   text: 'Vitepress搭建',
      //   collapsible: true,
      //   items: [
      //     { text: '起步', link: '/vitepress/start' },
      //     { text: '特有md语法', link: '/vitepress/syntax' },
      //     { text: '常用配置', link: '/vitepress/config' },
      //   ],
      // },
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
    // editLink: {
    //   pattern: 'https://github.com/Xaviw/XaviDocs/edit/main/docs/:path',
    //   text: '修改本文',
    // },
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
