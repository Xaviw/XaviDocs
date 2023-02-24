# VitePress文档基础搭建

`VitePress`是`Vue`团队提供的一个基于`Vue3`与`Vite`的开源框架，通过`MarkDown`文档和简单配置就能快速生成静态文档站点。与基于`WebPack`的`VuePress`相比，`VitePress`拥有更快的启动与打包速度

除了支持标准和扩展的`md`语法外，`VitePress`还支持在`md`文档内书写`Vue`语法，非常适合前端组件库文档或普通技术文档的搭建

## 一、创建项目

::: tip 环境要求
要求设备已安装 [Node](https://nodejs.org/zh-cn/) 、[Git](https://git-scm.com/) 环境，推荐更便捷的`Node`版本管理工具： [Volta](https://docs.volta.sh/guide/) 或 [FVM](https://fvm.app/docs/getting_started/overview)
:::

```shell
mkdir projectName

cd projectName

npm init -y

npm i -D vitepress vue
```

> 也可以使用`pnpm`或`yarn`

## 二、添加启动命令

在根目录`package.json`中添加以下代码

```json
{
  ...
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs"
  },
  ...
}
```

添加命令之后就可以通过`npm run dev`启动文档了

## 三、创建文档

在根目录中创建`docs`文件夹，作为工作目录，创建`index.md`作为第一个文档页面，保存后便可以在`http://localhost:5173`中查看了

`VitePress`使用文件路径作为路由地址，如果路径是`/docs/son/son.md`，访问路径就变成`http://localhost:5173/son/son.html`。如果文件名是`index.md`，则可以省略最后的`/index.html`

`VitePress`使用`markdown-it`作为语法解析器，具体语法可以参考[基本撰写和格式语法](https://docs.github.com/zh/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)，后续的[进阶语法](/vitepress/syntax.html)与[常用配置](/vitepress/config.html)中会介绍怎么完善文档内容

## 四、部署GitHubPages

`GitHubPages`是`GitHub`提供的一个静态站点部署服务，可以方便的将我们的文档部署到`GitHub`服务器上，并提供外网访问地址

首先创建仓库：

![创建仓库](/images/vitepress/start-1.png)
