# VitePress配置解析

`VitePress`中有两种配置

1. 项目级别配置，对应`docs/.vitepress/config`文件
2. 主题配置，对应`docs/.vitepress/theme/index`文件

## 项目配置

在`docs/.vitepress`下创建`config.ts`文件，使用框架提供的`defineConfig`便可以获得类型提示或查看`TS`类型

下面的代码简化了类型书写，并加上了属性介绍

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
    extends?: RawConfigExports<ThemeConfig>;
    // 打包后的基础路径，若部署到GitHub Pages配置为仓库名即可
    base?: string;
    // 页面html lang属性
    lang?: string;
    // html中的title标签
    title?: string;
    // 在具体的页面中会将'文章名 | title'作为页面title，定义false则只显示文章名，定义字符串则代替title属性中的文本
    titleTemplate?: string | boolean;
    // 定义<meta name="description" content="xxxx">
    description?: string;
    // 在head中添加自定义标签
    // <tag recordKey="recordValue">content</tag>
    head?: | [string, Record<string, string>][]
           | [string, Record<string, string>, string][];
    //  外观，默认亮色-支持切换，可以设置dark暗色，或false关闭切换选项
    appearance?: boolean | 'dark';

    themeConfig?: {
      // logo地址，可以设置亮色与暗色模式使用不同的logo
      logo?: | string
            | { src: string; alt?: string }
            | { light: string; dark: string; alt?: string }

      // 自定义左侧文档目录顶部的标题，默认使用config.title的值，设置false则为不显示
      siteTitle?: string | false

      // 定义右侧标题索引中显示几级标题，默认2，即显示一级和二级标题，支持设置范围或deep表示全部级别
      outline?: number | [number, number] | 'deep' | false

      // 右侧标题索引的标题，默认'On this page'
      outlineTitle?: string

      // 顶部导航栏内容
      nav?: {
        // 标题
        text: string
        // 跳转链接
        link: string
        // 嵌套的导航项，不能与link同时存在
        items: (NavItemChildren | NavItemWithLink)[]
        // 正则字符串，表示匹配页面链接规则，匹配成功时高亮显示
        // 比如某个目录下的页面均高亮，/xxx/
        activeMatch?: string
      }[]

      // 左侧文档目录
      // 支持直接传递一个数组或一个对象，对象中一个路径对应一个数组
      sidebar?: {
        // path同上面的activeMatch，定义匹配页面链接成功时才显示该目录
        [path: string] : {
          // 标题
          text?: string
          // 目录内容，支持嵌套
          items: | { text: string; link: string }[]
                | { text: string; link?: string; items: SidebarItem[] }[]
          // 是否可折叠
          collapsible?: boolean
          // 是否默认折叠
          collapsed?: boolean
        }[]
      }

      // 是否在页面底部显示编辑链接
      editLink?: {
        // 跳转链接合成规则，例如：https://github.com/用户/仓库/edit/分支/docs/:path
        // 点击按钮后会自动拼接页面链接到:path部分，跳转到GitHub的编辑页面中，其他用户编辑后可以提pr合并
        pattern: string
        // 显示的文字，默认'Edit this page'
        text?: string
      }

      // 自动获取git提交记录时间，展示在底部
      // 可以自定义文字，默认'Last updated'
      lastUpdatedText?: string

      // 定义底部上下页切换标签文字
      docFooter?: {
        // 默认'Previous page'
        prev?: string
        // 默认'Next page'
        next?: string
      }

      // 配置顶部右侧的社交链接
      socialLinks?: {
        icon: | 'discord'
              | 'facebook'
              | 'github'
              | 'instagram'
              | 'linkedin'
              | 'mastodon'
              | 'slack'
              | 'twitter'
              | 'youtube'
              | { svg: string }
        link: string
      }[]

      // 配置底部内容，有侧边目录栏时，footer不会显示
      footer?: {
        message?: string
        copyright?: string
      }

      // 顶部的语言切换配置
      localeLinks?: {
        text: string
        items: {
          text: string
          link: string
        }[]
      }

      // 展示搜索功能，需要开通algolia服务，参考官网https://vitepress.vuejs.org/guide/theme-search
      algolia?: {
        appId: string
        apiKey: string
        indexName: string
        placeholder?: string
        searchParameters?: any
        disableUserPersonalization?: boolean
        initialQuery?: string
        buttonText?: string
      }

      // 接入广告，参考官网https://vitepress.vuejs.org/guide/theme-carbon-ads
      carbonAds?: {
        code: string
        placement: string
      }
    },
    // 国际化设置，参考官网https://vitepress.vuejs.org/guide/i18n
    locales?: Record<string, LocaleConfig>;

    markdown?: {
      // 是否默认显示代码块行号
      lineNumbers?: boolean;
      config?: (md: MarkdownIt) => void;
      // md标题作为HTML锚点的设置，锚点用于通过url直接定位到对应标题
      anchor?: {
        // 要设置为锚点的标题级别，默认全部级别
        // 单个数字表示小于或等于设置的级别均作为锚点
        // 数组表示仅传入的级别作为锚点
        level?: number | number[];
        // 自定义链接中的锚点文本，str为标题本身，返回修改后的文本
        slugify?(str: string): string;
        // tokens为标题相关属性，返回文本作为锚点显示文本
        getTokensText?(tokens: Token[]): string;
        // 有重复的标题时，从第二个开始会显示为 #title-x
        // 设置重复标题编号从几开始，默认从1开始
        uniqueSlugStartIndex?: number;
        permalink?: (slug: string, opts: PermalinkOptions, state: StateCore, index: number) => void;
        callback?(token: Token, anchor_info: AnchorInfo): void;
        tabIndex?: number | false;
      },
      attrs?: {
          leftDelimiter?: string;
          rightDelimiter?: string;
          allowedAttributes?: string[];
          disable?: boolean;
      };
      defaultHighlightLang?: string;
      frontmatter?: FrontmatterPluginOptions;
      headers?: HeadersPluginOptions;
      sfc?: SfcPluginOptions;
      theme?: ThemeOptions;
      toc?: TocPluginOptions;
      externalLinks?: Record<string, string>;
    },
    lastUpdated?: boolean;
    /**
     * Options to pass on to `@vitejs/plugin-vue`
     */
    vue?: Options;
    /**
     * Vite config
     */
    vite?: UserConfig$1;
    srcDir?: string;
    srcExclude?: string[];
    outDir?: string;
    cacheDir?: string;
    shouldPreload?: (link: string, page: string) => boolean;
    /**
     * Configure the scroll offset when the theme has a sticky header.
     * Can be a number or a selector element to get the offset from.
     */
    scrollOffset?: number | string;
    /**
     * Enable MPA / zero-JS mode.
     * @experimental
     */
    mpa?: boolean;
    /**
     * Don't fail builds due to dead links.
     *
     * @default false
     */
    ignoreDeadLinks?: boolean;
    /**
     * @experimental
     * Remove '.html' from URLs and generate clean directory structure.
     *
     * Available Modes:
     * - `disabled`: generates `/foo.html` for every `/foo.md` and shows `/foo.html` in browser
     * - `without-subfolders`: generates `/foo.html` for every `/foo.md` but shows `/foo` in browser
     * - `with-subfolders`: generates `/foo/index.html` for every `/foo.md` and shows `/foo` in browser
     *
     * @default 'disabled'
     */
    cleanUrls?: CleanUrlsMode;
    /**
     * Use web fonts instead of emitting font files to dist.
     * The used theme should import a file named `fonts.(s)css` for this to work.
     * If you are a theme author, to support this, place your web font import
     * between `webfont-marker-begin` and `webfont-marker-end` comments.
     *
     * @default true in webcontainers, else false
     */
    useWebFonts?: boolean;
    /**
     * Build end hook: called when SSG finish.
     * @param siteConfig The resolved configuration.
     */
    buildEnd?: (siteConfig: SiteConfig) => Awaitable<void>;
    /**
     * Head transform hook: runs before writing HTML to dist.
     *
     * This build hook will allow you to modify the head adding new entries that cannot be statically added.
     */
    transformHead?: (ctx: TransformContext) => Awaitable<HeadConfig[]>;
    /**
     * HTML transform hook: runs before writing HTML to dist.
     */
    transformHtml?: (code: string, id: string, ctx: TransformContext) => Awaitable<string | void>;
    /**
     * PageData transform hook: runs when rendering markdown to vue
     */
    transformPageData?: (pageData: PageData) => Awaitable<Partial<PageData> | {
        [key: string]: any;
    } | void>;
})
```
