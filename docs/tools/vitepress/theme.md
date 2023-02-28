# 主题配置

## 自定义主题

新建`docs/.vitepress/theme/index.ts`文件作为项目的主题配置文件

`VitePress`提供了默认主题，在未创建主题配置文件的情况下会直接使用，我们也可以对默认主题进行修改或自定义主题

```ts
import DefaultTheme from 'vitepress/theme'

export default {
  // 自定义包裹每一个页面的容器组件
  Layout: Component,

  // 自定义404页面
  NotFound: Component,

  // 自定义增强功能
  // 参数中的app是项目Vue3 App实例
  // router是路由实例
  // siteData是当前站点的元数据
  enhanceApp({ app, router, siteData }) {
    // 可以在这里注册全局组件
    app.component('Comp', Comp);

    // 如果不是完全自定义主题,需要执行主题的默认行为
    DefaultTheme.enhanceApp({ app, router, siteData })
  },

  // 会在VitePress的setup钩子中执行,所有组合式api均可使用
  setup() { }
}
```

`Layout`组件格式如下：

```vue
<template>
  <h1>自定义布局</h1>

  <!-- md页面会渲染到Content中 -->
  <Content />
</template>
```

自定义布局组件还提供了部分关键位置的插槽，可以在[官网](https://vitepress.vuejs.org/guide/theme-introduction#extending-the-default-theme)中查看

## 自定义样式

默认主题中颜色等样式使用的`CSS`原生变量定义，可以通过重写变量或者重写样式类的方式自定义样式

例如新建`customize.css`文件(文件名可以任取)：

```css
/* docs/.vitepress/theme/customize.css */
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient( 135deg, #43CBFF 10%, #9708CC 100%);

  --vp-home-hero-image-background-image: linear-gradient( 135deg, #EE9AE5 10%, #5961F9 100%);
  --vp-home-hero-image-filter: blur(100px);
}

```

默认主题详细的`CSS`变量以及类可以在[源码仓库](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/styles)中查看，变量定义在`vars.css`中

> 渐变色可以在[CoolHue 2.0](https://webkul.github.io/coolhue/)中查找

上面的代码便是本站首页中重写的样式，定义后在样式配置文件中引入即可覆盖默认样式：

```ts
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import './customize.css'

export default DefaultTheme
```

## 使用其他主题

上面介绍了`VitePress`自定义主题的方法，自然能够找到开源的自定义主题

在GitHub中搜索[vitepress-theme](https://github.com/search?o=desc&q=vitepress-theme&s=stars&type=Repositories)，并按`starts`排序，能看到开源主题数量还是比较多的

因为VitePress还处在测试版，所以主题能力还不够完善，这些开源主题大多需要Clone源码后修改使用，而难以直接下载引入。主题仓库中使用介绍都比较详细，这里不在细说，可以自行探索。下面放两个开源主题预览图：

1. [vitepress-blog-zaun](https://github.com/clark-cui/vitepress-blog-zaun)

![vitepress-theme-sakura](/images/tools/vitepress-theme-1.png)

<hr />

2. [vitepress-theme-sakura](https://github.com/flaribbit/vitepress-theme-sakura)

![vitepress-theme-sakura](/images/tools/vitepress-theme-2.webp)
