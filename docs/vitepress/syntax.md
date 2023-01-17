---
title: vitepress扩展md语法
---

# {{$frontmatter.title}}

## 目录

`[[toc]]` 代表插入目录

## Frontmatter

支持 yaml、json 等格式，必须定义在页面顶部

::: code-group

```md
---
title: vitepress扩展md语法
---
```

```md
---
{ 'title': 'vitepress扩展md语法' }
---
```

:::
用于定义页面基础以及样式配置，会覆盖项目基础配置（title、description 定义的是页面 head 标签中的 title 与 meta）

除项目配置项外，话包括 head 配置页面 head 标签

```md
---
head:
  - - meta
    - name: description
      content: hello
---
```

还可以作为页面变量，通过 `{ { $frontmatter } }`引用（**注意：单反引号\`\`中也会被识别为变量，所以此处的双括号中间加了空格；三引号代码段中不会被识别**），例如本页标题就是引用的变量

## 表情

`:tada:` -> :tada:

## 自定义容器

```md
::: info 容器标题
支持 info、tip、warning、danger、details
标题可选，默认及对应类型
:::
```

::: info 容器标题
支持 info、tip、warning、danger、details
标题可选，默认显示对应类型
:::

## 代码功能

- 语言名称支持全称或简写
- 语言名后跟大括号 `{}` 为高亮行规则，语法同正则范围 `{1, 3-5}`
- `// [!code hl]` 高亮单行
- `// [!code focus]` 聚焦某行，其余部分模糊显示（hover 时恢复）
- `// [!code --]` 与 `// [!code ++]` 为 git 增删行效果
- `// [!code warning]` 与 `// [!code error]`为添加对应底色
- 行号可以在 config 中配置，或语言名后添加 `:line-numbers` 与 `:no-line-numbers`
- `<<< @/filepath` 可以导入代码文件显示（推荐`@`定位，默认为 docs 目录；使用`./`或直接`文件名/`的定位是从服务根目录定位），同样支持上述规则，但略有变化 `<<< @/name.ext{a-b ext:line-numbers}`，若不指定语言类型识别为 text
- 导入的文件内可以使用 `// #region xxx` 与 `// #endregion xx`分节，通过 `<<< @/filepath#xx` 显示对应节
- `::: code-group` `:::` 包裹多段代码可以组合代码
- `<!--@include: ./parts/basics.md-->` 可以引入其他 md 文档（不存在不会报错）
- vitepress 基于 markdown-it，更多配置可以再 config 中配置 markdown-it 插件

::: code-group

<<< @/vitepress/snippets/test.js#snippet{2 js}

<<< @/vitepress/snippets/test.js#section{2 js:line-numbers}

```ts
function test() {
  // ... // [!code warning]
  // do something // [!code focus]
  // ... // [!code error]
}
```

:::

## 使用 vue

vitepress 的 md 文件被渲染为 vue spa 页面（SSR 渲染，需遵守相关规则），所以任何 vue 特性均可使用，包括`script setup`、css 预处理器（需安装）等

vitepress 提供了`<ClientOnly />`组件可以用于包裹非 SSR 友好的组件

多处使用的组件可以在`.vitepress/theme/index.js`中使用`enhanceApp`配置，该函数参数为 app 实例

```js
import DefaultTheme from 'vitepress/theme';

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component('VueClickAwayExample', VueClickAwayExample);
  },
};
```
