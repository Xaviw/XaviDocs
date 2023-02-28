# 首页配置

`docs/index.md`会作为文档中的首页，可以通过[FrontMatter](/tools/vitepress/syntax#frontmatter)定义首页中的模板内容

下面介绍`FrontMatter`中首页相关属性：

## 布局-layout

支持`doc`、`home`、`page`

- `doc`表示页面使用`md`页面布局
- `home`表示页面使用首页布局，可以添加首页特有的选项
- `page`页面任然会解析`md`，但不会应用任何样式，需要自定义样式
- 设置为`false`可以取消布局，完全自定义页面

将首页`index.md`中的`layout`设置为`home`后，便可以添加下面的`hero`、`features`属性，定义首页内容

设置为`home`后可以继续使用`Vue`代码添加自定义内容，甚至可以通过设置为`page`、`false`完全自定义首页

## 介绍-hero

```md
---
layout: home

hero:
  # 标题上面的文字
  name: XaviDocs
  # 标题
  text: 个人前端技术文档
  # 标题下面的文字
  tagline: 文档持续搭建中，随便逛逛吧...
  # 标题右侧的图片
  image:
    light: svg/pic1.svg
    dark: svg/pic2.svg
  # 标题下方按钮
  actions:
    - text: 开始阅读
      link: /frontend/sourceCode/axios
      # 按钮样式，brand或alt，默认brand
      theme: brand
---
```
image还支持以下格式：

```md
image: xxx

image: 
  src: xxx
  # img标签alt属性，可选
  alt: xxx

image:
  light: xxx
  dark: xxx
  alt: xxx
```

免费图片素材资源在[工具系列-浏览器工具](/tools/recommend/browser#常用网页工具)中有推荐，本站所用的素材是在[iconFont-插画](https://www.iconfont.cn/illustrations/index)中复制的`svg`代码

> `svg`插图可能带有背景色，如果想改为透明，可以查看`svg`代码，找到对应的标签修改或添加`class`并设置`fill:rgba(0,0,0,0);`样式

## 特征-Features

```md
---
layout: home

features:
    # icon可不传
  - icon: 📖
    title: 前端系列
    details: 手把手入门源码阅读、UniApp实用经验...
    # link可不传，传入后hover时会有链接效果
    link: /tools/vitepress/start
    # linkText可不传，为提示跳转的文字
    linkText: 前往查看
  - icon: 🛠️
    title: 工具系列
    details: VitePress文档站点搭建教程、VSCode使用技巧、Windows体验优化...
    link: /tools/vitepress/start
    linkText: 前往查看
---
```

> `Windows`通过快捷键`Win + .`即可打开表情符号选择，也可以在浏览器中搜索后复制使用

## 效果

上面的代码得到的效果就是本站首页的效果，如何自定义样式，会在下一篇文章-[主题配置](/tools/vitepress/theme)中介绍：

![首页](/images/tools/vitepress-home-1.png)
