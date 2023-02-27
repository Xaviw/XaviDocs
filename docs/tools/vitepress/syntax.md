---
title: VitePress进阶语法
---

# {{$frontmatter.title}}

## 引用路径

在涉及到引用其他文件时需要注意路径的书写：

1. 引用网络地址，直接写完整链接
2. `[]()`跳转项目内页面时，支持相对路径或绝对路径，绝对路径应该写为页面链接基础路径后的部分（比如`docs/a/b.md`文件，绝对路径为`/a/b`，扩展名`md`或`html`可以省略）
3. `![]()`展示项目内图片时，应当将图片存储在`docs/public`文件夹下，在用绝对路径`/xxx.png`引用，`public`文件夹内可以自由创建子文件夹
4. 页面内引用代码文件时，需要使用`@/a/b.js`代表`docs/a/b.js`
5. 页面内引用其他`md`文件时，只能使用相对路径

::: warning 注意
图片等静态资源，最好放在`docs/public`文件夹下，`public`文件夹是`Vue`项目中的静态资源文件夹，打包时会将内部的文件原封不动的放在打包后的根路径中

用相对路径或从根目录开始的绝对路径引用的文件，会在打包时被`Vite`处理，小尺寸的图片转为`Base64`内嵌在页面中，大尺寸的文件则会被打包进`assets`文件夹下
:::

## 徽标 <Badge type="info" text="info" /> <Badge type="tip" text="tip" /> <Badge type="warning" text="warning" /> <Badge type="danger" text="danger" />

`type`支持`info`、`tip`、`warning`、`danger`

```md
## Title <Badge type="" text="" />
## Title <Badge type="info">custom element</Badge>
```

## 插入目录

`[[toc]]` 代表插入目录

## Frontmatter

支持`yaml`、`json`等格式，必须定义在页面顶部

::: code-group

```md
---
title: VitePress扩展md语法
---
```

```md
---
{ 'title': 'VitePress扩展md语法' }
---
```

:::

用于覆盖全局的样式配置，以及定义页面部分参数（`title`、`description`定义的是页面`head`标签中的`title`与`meta`）

除项目配置项外，还包括配置页面`HTML`代码中的`head`标签

```md
---
head:
  - - meta
    - name: description
      content: hello
---
```

定义的字段还可以作为页面变量，通过 `{ { $frontmatter } }`引用（**注意：书写在单反引号\`\`中也会被识别为变量，所以此处的双括号中间加了空格；三引号代码段中不会被识别**），本页标题就是引用的变量

## 自定义容器

支持的类型包括`info`、`tip`、`warning`、`danger`、`details`，标题可选，默认显示类型，语法为：

```md
::: 类型 容器标题
内容，换行需要留空行
:::
```

::: info
内容
:::

::: tip
内容
:::

::: warning
内容
:::

::: danger
内容
:::

::: details
内容
:::

## 代码功能

语言名称支持全称或简写

### 显示行号

在`docs/.vitepress/config`中可以设置代码块是否默认显示行号：

```ts
export default defineConfig({
  ...
  markdown: {
    ...
    lineNumbers: true,
  },
  ...
})
```

也可以在代码块语言名后添加 `:line-numbers` 与 `:no-line-numbers`设置行号开关

### 组合代码块

`::: code-group` `:::` 包裹多段代码可以组合代码

::: code-group

```md
: :: code-group

` ``md
第一个代码块
` ``

` ``
第二个代码块
` ``

: ::
```

```
第二个代码块
```

:::


### 高亮

语言名后跟大括号 `{}` 为高亮行规则，语法同正则范围 `{1-3,5}`

在具体的代码后面添加注释`[!code hl]`也可以高亮该行（`hl`即`highlight`）

::: code-group

```js {1-3,5}
1
2
3
...
5
...
单行注释实现高亮 // [!code hl]
```

```md
` ``js {1-3,5}
1
2
3
...
5
...
单行注释实现高亮 // [!code hl]
` ``
```

:::

### 聚焦

在具体的代码后面添加注释`[!code focus]`可以聚焦该行，其余部分模糊显示（`hover`时恢复）

::: code-group

```js
...
单行注释实现聚焦 // [!code focus]
...
```

```md
` ``js
...
单行注释实现聚焦 // [!code focus]
...
` ``
```

:::

### Git Diff 增删行效果

添加注释`[!code --]`或`[!code ++]`可以显示为`Git Diff`中的增删行效果

::: code-group

```js
[!code --] // [!code --]
[!code ++] // [!code ++]
```

```md
` ``js
[!code --] // [!code --]
[!code ++] // [!code ++]
` ``
```

:::

### 添加底色

注释`[!code warning]`或`[!code error]`可以为单行添加对应底色

::: code-group

```js
[!code warning] // [!code warning]
[!code error] // [!code error]
```

```md
` ``js
[!code warning] // [!code warning]
[!code error] // [!code error]
` ``
```

:::

### 引入代码文件

在`md`中书写`<<< @/filepath`可以导入对应位置的代码文件显示，支持`@`定位，默认为`docs`目录

被引入的文件内同样支持上述的高亮、聚焦等规则；引用时也支持高亮与是否显示行号规则，但略有变化 `<<< @/name.ext{a-b ext:line-numbers}`，若不指定语言类型识别为`text`

导入的文件内可以添加注释`#region xxx`与`#endregion xx`分节，通过`<<< @/filepath#xx`仅显示对应节

### 引入其他md

在`md`中书写`<!--@include: ./parts/basics.md-->`可以引入其他`md`文档（不存在不会报错）

## 使用 Vue

`VitePress`的`md`文件通过`markdown-it`解析后，被渲染为`Vue`页面，所以可以直接在`md`文件中使用`Vue`语法（`SSR`渲染，需遵守相关规则），包括`script setup`、`css`预处理器（需安装）等

比较实用的比如使用`<hr />`绘制分割横线等，下面是直接在`md`中写的一个按钮：

<div>
  <button style="padding:10px 40px;background:skyBlue;color:white;border-radius: 24px;font-size:1.2rem">按钮</button>
</div>

<hr />

`VitePress`全局注册了`<ClientOnly />`组件可以用于包裹非`SSR`友好的组件，被包裹的组件在渲染到客户端后才会开始执行，避免`SSR`过程中报错

<hr />

多处使用的组件可以在`.VitePress/theme/index.js`中使用`enhanceApp`配置，该函数参数为 app 实例

```js
import DefaultTheme from 'VitePress/theme';
import XXX from 'xxx'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component('XXX', XXX);
  },
};
```
