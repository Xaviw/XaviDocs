import type { DefaultTheme, UserConfig } from 'vitepress'
import type { Pages } from './readPages'
import sidebar from './sidebar'
import readPages from './readPages'
import AutoSidebar from './autoSidebarPlugin'

type Config = UserConfig<DefaultTheme.Config & { pages: Pages[] }>

const config: Config = {
  locales: { zh: { label: '简体中文' } },
  title: 'Xavi的技术文档',
  description: '个人前端技术文档',
  lang: 'zh-cmn-Hans',
  base: '/XaviDocs/',
  // 忽略根目录的README和TODO
  srcExclude: ['/README.md', '/TODO.md'],
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
    defaultHighlightLang: 'js',
  },
  // vite: {
  //   plugins: [AutoSidebar({path: '/'})],
  // },
  themeConfig: {
    logo: '/svg/logo.svg',
    nav: [
      {
        text: '前端系列',
        activeMatch: '/前端系列/',
        link: '/前端系列/源码阅读/Axios源码解析',
      },
      {
        text: '工具系列',
        activeMatch: '/工具系列/',
        link: '/工具系列/VitePress搭建/基础搭建',
      },
    ],
    sidebar: sidebar,
    outline: 'deep',
    outlineTitle: '目录',
    socialLinks: [{ icon: 'github', link: 'https://github.com/Xaviw/XaviDocs' }],
    editLink: {
      pattern: 'https://github.com/Xaviw/XaviDocs/edit/master/docs/:path',
      text: '修改本文',
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    darkModeSwitchLabel: '切换主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '切换语言',
    lastUpdatedText: '更新时间',
    externalLinkIcon: true,
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
          },
          modal: {
            displayDetails: '显示详情',
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除',
            footer: {
              closeText: '关闭',
              selectText: '选择',
              navigateText: '切换',
            },
          },
        },
      },
    },
    pages: await readPages({ sidebar, path: '.' }),
  },
}

export default config
