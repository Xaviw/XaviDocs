# 首页配置

`docs/index.md`会作为文档中的首页，可以通过[FrontMatter](/tools/vitepress/syntax#frontmatter)定义首页中的模板内容

下面介绍`FrontMatter`中首页相关属性：

## 布局-layout

支持`doc`、`home`、`page`

- `doc`表示页面应用为md页面样式
- `home`表示页面应用为首页，可以添加首页特有的选项
- `page`表示页面完全自定义样式

## hero

将首页`layout`设置为`home`后，便可以添加`hero`属性，定义首页标题部分内容

```md
---
layout: home

hero:
  # 标题上面的文字
  name: VitePress
  # 标题
  text: Vite & Vue Powered Static Site Generator
  # 标题下面的文字
  tagline: Simple, powerful, and performant. Meet the modern SSG framework you've always wanted.
  actions:
      # 按钮样式，brand或alt
    - theme: brand
      text: Get Started
      link: /guide/what-is-vitepress
    - theme: alt
      text: View on GitHub
      link: https://github.com/vuejs/vitepress
---
```

得到的效果就是[VitePress官网首页](https://vitepress.vuejs.org/)的效果：

![VitePress官网首页的效果](/images/tools/vitepress-home-1.png)
