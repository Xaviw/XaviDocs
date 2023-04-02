import { DefaultTheme } from 'vitepress'

const sidebar: DefaultTheme.Sidebar = {
  '/前端系列/': [
    {
      text: '源码系列',
      items: [
        { text: 'Axios', link: '/前端系列/源码阅读/Axios源码解析' },
        // { text: 'Vuex', link: '/前端系列/源码阅读/Vuex源码解析' },
      ],
    },
    {
      text: '工程化',
      items: [
        { text: 'JS模块化原理', link: '/前端系列/工程化/JS模块化原理' },
        { text: '掌握package.json', link: '/前端系列/工程化/掌握package' },
        // { text: '掌握tsconfig.json', link: '/前端系列/工程化/掌握tsconfig' },
      ],
    },
    {
      text: 'uniapp',
      items: [
        { text: 'uniapp对比原生小程序', link: '/前端系列/uniapp/uniapp对比原生小程序' },
        { text: '解决首页闪烁问题', link: '/前端系列/uniapp/解决首页闪烁问题' },
        { text: '实现全局自定义浮层', link: '/前端系列/uniapp/实现全局自定义浮层' },
        { text: '封装APP跳转微信小程序支付方法', link: '/前端系列/uniapp/封装APP跳转微信小程序支付方法' },
      ],
    },
  ],
  '/工具系列/': [
    {
      text: 'Vitepress搭建',
      collapsed: false,
      items: [
        { text: '基础搭建', link: '/工具系列/VitePress搭建/基础搭建' },
        { text: '进阶语法', link: '/工具系列/VitePress搭建/进阶语法' },
        { text: '配置解析', link: '/工具系列/VitePress搭建/配置解析' },
        { text: '首页配置', link: '/工具系列/VitePress搭建/首页配置' },
        { text: '主题配置', link: '/工具系列/VitePress搭建/主题配置' },
        { text: '自动生成目录', link: '/工具系列/VitePress搭建/自动生成目录' },
        { text: '扩展首页内容', link: '/工具系列/VitePress搭建/扩展首页内容' },
      ],
    },
    {
      text: '编辑器',
      items: [
        { text: 'VSCode设置', link: '/工具系列/编辑器/VSCode设置' },
        { text: 'VSCode插件推荐', link: '/工具系列/编辑器/VSCode插件推荐' },
        { text: '实用语法-JSDoc、Emmet', link: '/工具系列/编辑器/实用语法-JSDoc、Emmet' },
        { text: 'HBuilderX设置', link: '/工具系列/编辑器/HBuilderX设置' },
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
