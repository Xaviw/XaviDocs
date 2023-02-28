import { DefaultTheme } from 'vitepress'

const sidebar: DefaultTheme.Sidebar = {
  '/前端系列/': [
    {
      text: '源码系列',
      items: [{ text: 'Axios', link: '/前端系列/源码阅读/Axios源码解析' }],
    },
    {
      text: 'UniApp',
      items: [{ text: 'uniapp对比原生小程序', link: '/前端系列/uniapp/UniApp对比原生小程序' }],
    },
  ],
  '/工具系列/': [
    {
      text: 'Vitepress搭建',
      collapsed: false,
      items: [
        { text: '基础搭建', link: '/工具系列/VitePress搭建/使用VitePress搭建文档站点' },
        { text: '进阶语法', link: '/工具系列/VitePress搭建/VitePress进阶语法' },
        { text: '配置解析', link: '/工具系列/VitePress搭建/VitePress配置解析' },
        { text: '首页配置', link: '/工具系列/VitePress搭建/VitePress首页配置' },
        { text: '主题配置', link: '/工具系列/VitePress搭建/VitePress主题配置' },
      ],
    },
    {
      text: '编辑器',
      items: [
        { text: 'VSCode设置', link: '/工具系列/编辑器/VSCode设置' },
        { text: 'VSCode插件推荐', link: '/工具系列/编辑器/VSCode插件推荐' },
        { text: '实用语法-JSDoc、Emmet', link: '/工具系列/编辑器/实用语法-JSDoc、Emmet' },
      ],
    },
    {
      text: '实用工具',
      collapsed: false,
      items: [
        { text: 'Windows工具', link: '/工具系列/实用工具/Windows实用工具' },
        { text: '浏览器工具', link: '/工具系列/实用工具/实用浏览器工具' },
      ],
    },
  ],
}

export default sidebar
