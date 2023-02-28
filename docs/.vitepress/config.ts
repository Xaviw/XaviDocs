import { defineConfig } from 'vitepress'
import sidebar from './sidebar'
import juejin from '../public/svg/juejin'

export default defineConfig({
  // 打包后的基础路径，若部署到GitHub Pages配置为仓库名即可
  base: '/XaviDocs/',

  // 定义需要预加载的页面
  // shouldPreload?: (link: string, page: string) => boolean,

  // 是否显示上次修改时间
  lastUpdated: true,

  // 页面html lang属性
  lang: 'zh-cmn-Hans',

  // 打包时是否忽略错误链接导致的错误，默认false
  // 设为localhostLinks时仅忽略localhost链接错误，其他错误链接会报错中断打包
  ignoreDeadLinks: true,

  // 删除页面链接中的.html
  cleanUrls: true,

  // html中的title标签
  title: 'Xavi的技术文档',

  // 在具体的页面中会将'文章名 | title'作为页面title，定义false则只显示文章名，定义字符串则代替title属性中的文本
  // titleTemplate?: string | boolean,

  // 定义<meta name="description" content="xxxx">
  description: '个人前端技术文档',

  // 在head中添加自定义标签
  // <tag recordKey="recordValue">content</tag>
  // head?: | [string, Record<string, string>][]
  //        | [string, Record<string, string>, string][],

  // 定义目录到链接的映射，查看文档https://vitepress.vuejs.org/guide/routing#customize-the-mappings
  // rewrites?: Record<string, string>,

  //  外观，默认亮色-支持切换，可以设置dark暗色，或false关闭切换选项
  // appearance?: boolean | 'dark',

  themeConfig: {
    // 是否显示右边目录
    // aside: false,

    // logo地址，可以设置亮色与暗色模式使用不同的logo
    logo: 'images/xavi-logo.png',

    // 自定义左侧文档目录顶部的标题，默认使用config.title的值，设置false则为不显示
    // siteTitle?: string | false,

    // 定义右侧标题索引中显示几级标题，默认2，即显示一级和二级标题，支持设置范围或deep表示全部级别
    outline: 'deep',

    // 标题上的<Badge />徽标默认会显示在右侧索引中，可以设置false不显示
    // outlineBadges?: boolean,

    // 右侧标题索引的标题，默认'On this page'
    outlineTitle: '目录',

    // 切换模式标签，默认`Appearance`。仅移动端下显示
    darkModeSwitchLabel: '切换主题',

    // 左边栏菜单标签，默认`Menu`，仅移动端下显示
    sidebarMenuLabel: '菜单',

    // 返回顶部标签，默认`Return to top`，仅移动端下显示
    returnToTopLabel: '返回顶部',

    // 顶部导航栏内容
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

    // 左侧文档目录
    // 支持直接传递一个数组或一个对象，对象中一个路径对应一个数组
    sidebar: sidebar,

    // 是否在页面底部显示编辑链接
    editLink: {
      // 跳转链接合成规则，例如：https://github.com/用户/仓库/edit/分支/docs/:path
      // 点击按钮后会自动拼接页面链接到:path部分，跳转到GitHub的编辑页面中，其他用户编辑后可以提pr合并
      pattern: 'https://github.com/Xaviw/XaviDocs/edit/master/docs/:path',
      // 显示的文字，默认'Edit this page'
      text: '修改本文',
    },

    // 自动获取git提交记录时间，展示在底部
    // 可以自定义文字，默认'Last updated'
    lastUpdatedText: '更新时间',

    // 定义底部上下页切换标签文字
    docFooter: {
      // 默认'Previous page'
      prev: '上一篇',
      // 默认'Next page'
      next: '下一篇',
    },

    // 配置顶部右侧的社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Xaviw' },
      {
        icon: { svg: juejin },
        link: 'https://juejin.cn/user/3192637500426840',
      },
    ],

    // 配置底部内容，有侧边目录栏时，footer不会显示
    // footer?: {
    //   message?: string
    //   copyright?: string
    // },

    // 顶部的语言切换配置
    // localeLinks?: {
    //   text: string
    //   items: {
    //     text: string
    //     link: string
    //   }[]
    // },

    // 展示搜索功能，需要开通algolia服务，参考官网https://vitepress.vuejs.org/guide/theme-search
    // algolia?: {
    //   appId: string
    //   apiKey: string
    //   indexName: string
    //   placeholder?: string
    //   searchParameters?: any
    //   disableUserPersonalization?: boolean
    //   initialQuery?: string
    //   buttonText?: string
    // },

    // 接入广告，参考官网https://vitepress.vuejs.org/guide/theme-carbon-ads
    // carbonAds?: {
    //   code: string
    //   placement: string
    // },
  },

  markdown: {
    // 是否默认显示代码块行号
    lineNumbers: true,

    // specify default language for syntax highlighter
    defaultHighlightLang: 'js',

    // Custom theme for syntax highlighting.
    // You can use an existing theme.
    // See: https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-themes
    // Or add your own theme.
    // See: https://github.com/shikijs/shiki/blob/main/docs/themes.md#loading-theme
    // theme?:
    //   | Shiki.IThemeRegistration
    //   | { light: Shiki.IThemeRegistration; dark: Shiki.IThemeRegistration }

    // Add support for your own languages.
    // https://github.com/shikijs/shiki/blob/main/docs/languages.md#supporting-your-own-languages-with-shiki
    // languages?: Shiki.ILanguageRegistration,

    // markdown-it-anchor plugin options.
    // See: https://github.com/valeriangalliat/markdown-it-anchor#usage
    // anchor?: {
    //   // 要设置为锚点的标题级别，默认全部级别
    //   // 单个数字表示小于或等于设置的级别均作为锚点
    //   // 数组表示仅传入的级别作为锚点
    //   level?: number | number[];
    //   // 自定义链接中的锚点文本，str为标题本身，返回修改后的文本
    //   slugify?(str: string): string;
    //   // tokens为标题相关属性，返回文本作为锚点显示文本
    //   getTokensText?(tokens: Token[]): string;
    //   // 有重复的标题时，从第二个开始会显示为 #title-x
    //   // 设置重复标题编号从几开始，默认从1开始
    //   uniqueSlugStartIndex?: number;
    //   permalink?: (slug: string, opts: PermalinkOptions, state: StateCore, index: number) => void;
    //   callback?(token: Token, anchor_info: AnchorInfo): void;
    //   tabIndex?: number | false;
    // },

    // markdown-it-attrs plugin options.
    // See: https://github.com/arve0/markdown-it-attrs
    // attrs?: {
    //   leftDelimiter?: string
    //   rightDelimiter?: string
    //   allowedAttributes?: string[]
    //   disable?: boolean
    // },

    // @mdit-vue/plugin-frontmatter plugin options.
    // See: https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-frontmatter#options
    // frontmatter?: FrontmatterPluginOptions,

    // @mdit-vue/plugin-headers plugin options.
    // See: https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-headers#options
    // headers?: HeadersPluginOptions,

    // @mdit-vue/plugin-sfc plugin options.
    // See: https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-sfc#options
    // sfc?: SfcPluginOptions,

    // @mdit-vue/plugin-toc plugin options.
    // See: https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    // toc?: TocPluginOptions,

    // Configure the Markdown-it instance.
    // config?: (md: MarkdownIt) => void,
  },
  // 存储md文档的目录，相对于根目录，默认.
  // srcDir?: string,

  // srcExclude?: string[],

  // 打包文件存储的位置，相对于根目录，默认./.vitepress/dist
  // outDir?: string,

  // 缓存地址，相对于根目录，默认./.vitepress/cache
  // cacheDir?: string,

  // 国际化设置，参考官网https://vitepress.vuejs.org/guide/i18n
  // locales?: LocaleConfig<ThemeConfig>,

  // extends?: RawConfigExports<ThemeConfig>,

  // 传递给`@vitejs/plugin-vue`的参数
  // vue?: Options,

  // vite配置
  // vite?: UserConfig$1,

  // 当主体有粘性布局的header时，设置滚动偏移量
  // 可以设置一个数字或元素选择器
  // scrollOffset?: number | string,

  // MPA / zero-JS默认
  // mpa?: boolean,

  /**
   * Build end hook: called when SSG finish.
   * @param siteConfig The resolved configuration.
   */
  // buildEnd?: (siteConfig: SiteConfig) => Awaitable<void>,

  /**
   * Render end hook: called when SSR rendering is done.
   */
  // postRender?: (context: SSGContext) => Awaitable<SSGContext | void>,

  /**
   * Head transform hook: runs before writing HTML to dist.
   *
   * This build hook will allow you to modify the head adding new entries that cannot be statically added.
   */
  // transformHead?: (context: TransformContext) => Awaitable<HeadConfig[]>,

  /**
   * HTML transform hook: runs before writing HTML to dist.
   */
  // transformHtml?: (code: string, id: string, ctx: TransformContext) => Awaitable<string | void>,

  /**
   * PageData transform hook: runs when rendering markdown to vue
   */
  // transformPageData?: (pageData: PageData) => Awaitable<Partial<PageData> | {
  //   [key: string]: any;
  // } | void>,
})
