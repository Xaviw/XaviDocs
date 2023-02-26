# 使用VitePress搭建文档站点

`VitePress`是`Vue`团队提供的一个基于`Vue 3`与`Vite`的开源框架，通过`MarkDown`文档和简单配置就能快速生成静态文档站点。与基于`WebPack`的`VuePress`相比，`VitePress`拥有更快的启动和打包速度

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

`VitePress`使用`markdown-it`作为`md`语法解析器，具体语法可以参考[基本撰写和格式语法](https://docs.github.com/zh/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)，后续的[进阶语法](/tools/vitepress/syntax)与[常用配置](/tools/vitepress/config)中会介绍怎么完善文档内容

## 四、部署GitHub Pages

`GitHub Pages`是`GitHub`提供的一个静态站点部署服务，可以方便的将我们的文档部署到`GitHub`服务器上，并提供外网访问地址

1. 在`GitHub`中创建仓库
2. 项目根目录中创建`.gitignore`

  可以自行编辑

  ```
  .DS_Store
  node_modules/
  /docs/.vitepress/dist/
  /docs/.vitepress/cache/

  .env.local
  .env.*.local

  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  pnpm-debug.log*
  pnpm-error.log*

  .idea
  .vscode
  .hbuilderx
  ```

3. 提交仓库
   
  在项目根目录中打开终端并执行（`master`为安装`git`时设置的主分支名，默认为`master`）：

  ```shell
  git init
  git add .
  git commit -m "init"
  git branch -M master
  # 替换仓库地址
  git remote add origin git@github.com:xxx/xxx.git
  git push -u origin master
  ```

4. 创建并修改项目配置

  因为`GitHub Pages`部署后会将仓库名作为根目录，也就是`https://xaviw.github.io/仓库名/`。所以需要修改项目打包后的基础路径，不然项目内使用的路径默认从根目录查找资源则会查找失败

  创建`docs/.vitepress/config.ts`并添加：

  ```ts
  import { defineConfig } from 'vitepress'

  export default defineConfig({
    base: '/仓库名/',
  })
  ```

5. 部署`GitHub Pages`

  在项目根目录中打开终端并执行:

  ```shell
  npm run build
  cd docs/.vitepress/dist
  git init
  git add -A
  git commit -m "deploy"
  # 替换仓库地址
  git push -f git@github.com:xxx/xxx.git master:gh-pages
  ```

  可以看出来部署实际上是将打包后的文件提交到`gh-pages`分支中，这是`GitHub Pages`指定的分支名，检测到该分支中的文件更新后则会自动触发部署，等待几分钟即可在仓库中看到已部署的站点链接：

  ![GitHub Pages 链接](/images/tools/vitepress-start-1.png)

## 五、使用脚本简化部署流程

上述部署站点的方式需要敲较多的命令，我们可以通过编写脚本的方式简化这一操作流程

项目中通常使用`bash`语法在`sh`文件中编写命令脚本，因为`Windows`中默认没有`bash`命令，以及尝试新工具的原因，这里使用由谷歌开源，[JS年度明星项目](https://risingstars.js.org/2021/zh)-2021年第一名的[zx](https://github.com/google/zx)编写

安装`zx`：

```shell
npm i zx -D
```

在项目根目录中创建`deploy.mjs`文件：

```js
#!/usr/bin/env zx

import { $, cd } from 'zx/core'

// 打包
await $`npm run build`
// 跳转
cd(`docs/.vitepress/dist`)
// dist文件夹内初始化git并提交
await $`git init`
await $`git add -A`
await $`git commit -m 'deploy'`
// 替换为自己的git地址
await $`git push -f git@github.com:xxx/xxx.git master:gh-pages`
// 0为”成功退出码“，不写这句会返回1，为“失败退出码”
await $`exit 0`
```

在`package.json`中添加命令：


```json
{
  ...
  "scripts": {
    ...
    "deploy": "zx deploy.mjs"
  },
  ...
}
```

之后便可以通过`npm run deploy`一条命令实现自动部署了
