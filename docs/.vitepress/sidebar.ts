import { DefaultTheme } from 'vitepress'

const sidebar: DefaultTheme.Sidebar = {
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
      collapsed: false,
      items: [
        { text: '基础搭建', link: '/tools/vitepress/start' },
        { text: '进阶语法', link: '/tools/vitepress/syntax' },
        { text: '配置解析', link: '/tools/vitepress/config' },
        { text: '首页配置', link: '/tools/vitepress/home' },
      ],
    },
    {
      text: '编辑器',
      items: [
        { text: 'VSCode设置', link: '/tools/editor/vscode-setting' },
        { text: 'VSCode插件推荐', link: '/tools/editor/vscode-extension' },
        { text: '实用语法-JSDoc、Emmet', link: '/tools/editor/jsdoc-emmet' },
      ],
    },
    {
      text: '实用工具',
      collapsed: false,
      items: [
        { text: 'Windows工具', link: '/tools/recommend/windows' },
        { text: '浏览器工具', link: '/tools/recommend/browser' },
      ],
    },
  ],
}

export default sidebar
