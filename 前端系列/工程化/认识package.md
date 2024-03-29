---
useArticleTitle: true
---

# 认识 package.json

`package.json`存在于每个基于`node`的前端工程化项目中，所以正确的认识该文件中的字段，对理清项目流程、提升工程化能力格外重要

## 介绍

[中文文档](https://nodejs.cn/api/packages.html#introduction)中翻译的介绍，理解起来仍有难度。简单来说`package.json`就是一个包（`package`）描述文件，在`node`对包内文件进行处理（比如模块类型识别等）时，会按照最近的平级或上级`package.json`中描述的规则处理，另外`package.json`默认不对`node_modules`目录生效

## 生成

`package.json`可以手动生成也可以通过命令生成:

```shell
# 根据提示输入字段内容
npm init
# 全部使用默认值生成
npm init -y
# yarn或pnpm也有同样的命令，区别是yarn和pnpm都是默认生成，不需要加-y
# pnpm生成内容与npm默认内容一致，yarn生成只有name和packageManager字段
yarn init
pnpm init
```

## Node 使用的字段

### type

目前`JS`有两种主流模块化方案，分别是`Node`采用的`CommonJS`，和最新的`ESModule`，推荐先阅读[JS 模块化原理](/前端系列/工程化/JS模块化原理)熟悉这两种模块化规则。对于不同的模块类型，引擎会采用不同的模块解析器进行处理，所以需要正确的识别模块类型

`type`默认值为`commonjs`，所以项目中的文件默认会采用`CommonJS`模块规则解析。如果指定为`module`则会采用`ESModule`模块规则解析

官方还扩展了`.mjs`和`.cjs`扩展名，分别对应`ESModule`和`CommonJS`。设置这两种扩展名的文件将始终按对应模块解析器解析，不受`type`字段限制

也就是说如果没指定`type`或指定为`commonjs`时，项目内要使用`ESModule`语法，则需要将对应的文件改为`.mjs`扩展名。反之`type`指定为`module`时，应该将`CommonJS`模块改为`.cjs`扩展名

### main

定义包的入口文件

比如在项目中下载了包`A`，通过`import A from 'A'`方式引入时，实际查找的就是`node_modules/A/main定义的路径`：

### module

`module`字段最早由`rollup`提出，目前在中文官网中还没有提到。目的是提供`ESModule`入口，这样打包器能够利用`ESModule`的静态分析能力实现`TreeShaking`功能

如果打包器支持`module`字段，则在查找包时，首先会尝试以`ESModule`规则读取`module`对应文件

### browser

在例如`Axios`这种同时支持`node`端和浏览器端的包中，对于不同环境可能依赖于不同的模块（`Axios`中`node`环境使用`http`请求，浏览器环境使用`xhr`请求），`browser`字段就是为了更好的实现这一功能

当使用了例如`webpack`等打包器时，如果指定环境`target`为`web`，则会使用该字段指定的文件规则

支持单个属性，代表入口文件。也支持定义多个键值对，代表替换对于路径

```json
// 单个字段，代表作为浏览器环境的入口文件
"browser": "./lib/browser/main.js"
// 指定键值对时，解析对应的键时，会替换到对应值的路径
"browser": {
  "module-a": "./browser/module-a.js",
  "./server/module-b.js": "./browser/module-b.js",
  // 还支持配置false，防止模块被加载
  "module-c": false
}
```

### exports

作为`main`、`module`的替代方案，多个字段同时存在时，会优先使用`exports`

允许定义多个入口点，对于暴露入口较少的情况，官方建议明确指定每个入口点；暴露入口过多时，可以直接导出整个文件夹

```json
{
  "exports": {
    // 明确指定每个入口点
    ".": "./lib/index.js",
    "./lib": "./lib/index.js",
    // 官方建议同时提供有扩展名和无扩展名的子路径
    "./lib/index": "./lib/index.js",
    "./lib/index.js": "./lib/index.js",
    // 导出整个文件夹
    "./feature/*": "./lib/feature/*.js",
    // 导出文件夹中有不想暴露的入口点时，可以明确指定不暴露
    "./feature/internal/*": null
  }
}
```

**每个路径都应该相当于包根目录**。仅有根目录暴露时，可以简写为：`"exports": "./index.js"`

<hr />

支持条件导出，常用条件包括`import`、`require`、`default`

```json
{
  "exports": {
    // 使用import导入时，加载mjs文件
    "import": "./index.mjs",
    // 使用require导入时 ，加载cjs文件
    "require": "./index.cjs",
    // default作为通用后备选项，应该始终放在最后
    "default": "./index.js"
  },
  // 也可以用在导出子路径
  "exports": {
    ".": "./index.js",
    "./feature": {
      "import": "./feature/index.mjs",
      "require": "./feature/index.cjs"
    }
  }
}
```

**定义`exports`后，导入非入口点的路径时会抛出`ERR_PACKAGE_PATH_NOT_EXPORTED`错误**

### name

定义包名，也就是发布到`npm`仓库的名字，需要符合[命名规则](https://nodejs.cn/npm/cli/v8/configuring-npm/package-json/#name)

::: tip
`@a/b`格式的包名含义是`a`范围中名字为`b`的包，里面的`@`和`/`属于命名规范。范围的作用是将一系列相关的包组织在一起，更重要的是不用担心包名重复的问题。如何发布范围，参考[官方文档](https://nodejs.cn/npm/cli/v8/using-npm/scope/#)
:::

### packageManager

截至发文仍处于实验性阶段，需要`NodeJS`版本大于等于`16.9.0`。基于新版`node`中附带的`corepack`包，用于统一项目包管理器，具体可以参考[这篇文章](https://www.jianshu.com/p/c239ed5dedd6)

> 如果使用 NVM、Volta 等工具管理 Node 版本时，corepack 命令可能不可用，可以在官方 issue 中找到解决办法

## 包管理器常用字段

### scripts

包自身的运行脚本，例如本文档的启动方式：

```json
{
  "scripts": {
    "dev": "vitepress dev"
  }
}
```

可以通过`npm run dev`的方式调用对应的`vitepress dev`命令

<hr />

`npm`还提供了前后脚本关键字`pre`、`post`，例如

```json
{
  "scripts": {
    "preecho": "",
    "echo": "",
    "postecho": ""
  }
}
```

执行`npm run echo`后会分别调用`preecho`、`echo`、`postecho`

除此之外还提供了一些特定的脚本，可以自行查看[官方文档](https://nodejs.cn/npm/cli/v8/using-npm/scripts/#life-cycle-scripts)

### config

`config`字段用于添加命令行环境变量，添加后`scripts`字段中指定运行的脚本中便可以使用添加的环境变量

```json
{
  "config": { "port": "8888" },
  "scripts": { "start": "node server.js" }
}
```

```js
// server.js
console.log(process.env.npm_package_config_port); // 8888
```

### dependencies

```shell
# i是全称install的缩写命令
# 常见的--save或-S可以不用添加
# @version可以省略，默认最新稳定版本
npm i lib-name@version
pnpm i lib-name@version
yarn add lib-name@version
```

运行时依赖（运行相关的核心文件），包含包名以及版本的映射，通过包管理器安装时会自动将包名以及版本添加到`dependencies`中

标准的项目版本规则通常为：`主版本号.副版本号.修订版本号-预发布标签.预发布版本号`，例如`vitepress`当前版本`1.0.0-alpha.49`。详情可以查看[semver](https://github.com/npm/node-semver#versions)

版本号前可以指定范围符，包括：

- `<`：小于指定版本号
- `<=`：小于对于指定版本号
- `>`、`>=`同理
- `=`：与指定版本号系统，等号可以省略
- 范围标识符可以混用，例如`>=1.2.0<2.0.0`，也可以使用`1.2.0-2.0.0`表示
- `||`：指定多个版本范围
- `x`：可以作为通配符，例如`1.x`表示主版本为 1，副版本，修订版本任意
- `~`：指定版本到副版本+1 的范围
- `^`：指定版本到首位非 0 版本号+1 的范围
- `*`：匹配任何范围
- `tag`标记：匹配发布为`tag`的特定版本，例如`latest`标记

预发布标签通常由 alpha 与 beta。alpha 版本表示工作正在开发中，可以看作技术预览版，beta 版本表示产品已做好发布的准备，可以看作测试版。存在预发布标签时，即使使用范围符，也需要满足主版本号、副版本号、修订版本号相同

### devDependencies

```shell
# -D也可以写作--save-dev
npm i lib-name@version -D
pnpm i lib-name@version -D
yarn add lib-name@version -D
```

开发时依赖（例如代码格式化、测试等，与主题功能无关），内容同`dependencies`。通过包管理器安装时会自动将`xxx`添加到`devDependencies`中

在不作为包发布的项目中，`dependencies`和`devDependencies`没有区别，因为打包器是按照导入读取的文件，与依赖项无关

但如果项目要作为包发布，用户引入你的包时，则只会下载`dependencies`中的依赖

### peerDependencies

```shell
npm i lib-name@version --save-peer
pnpm i lib-name@version --save-peer
yarn add lib-name@version --save-peer
```

用于指定当前包需要的宿主环境，内容同`dependencies`，通常在插件中使用

例如开发`vue`的插件，如果将`vue`放在`dependencies`中，则用户在本身已安装`vue`的项目中引用你的插件时，还会再安装一次`vue`，造成浪费。如果定义在`peerDependencies`中，`npm install`默认不会重复安装`vue`，只要定义的版本号与用户已安装版本号匹配，就能直接使用。而如果用户还没有安装对应版本的`vue`，则会提示用户有`peerDependencies`未安装

### files

定义包作为依赖被安装时，只包含哪些文件，默认`["*"]`也就是全部文件

无论如何设置，`package.json`、`README`、`LICENSE/LICENCE`、`main`字段文件始终会包含

相反，`.git`等文件会被忽略

### bin

定义可执行命令添加到系统环境变量中，例如本文档使用到的`zx`：

```json
{
  "bin": {
    "zx": "./build/cli.js"
  },
  // 也可以简写，此时命令名称为包名
  "bin": "./build/cli.js"
}
```

### engines

指定适用的`node`版本，版本规则同依赖项

```json
{
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### version

发布到`npm`的版本号

### description

包介绍

### keywords

包关键字，用于在`npm`中发现你的包

### homepage

项目主页地址

### bugs

项目问题追踪地址或邮件地址

```json
{
  "url": "例如github issue页地址",
  "email": "email@xxx.com"
}
```

### license

项目使用的许可证，表示别人能如何利用你的开源项目

### author、contributors

项目开发人员

```json
{
  "author": {
    "name": "",
    "email": "",
    "url": ""
  },
  // 或者精简为一行
  "author": "name <email> (url)"
  // contributors格式同author
  "contributors": [
    {...},
    {...}
  ]
}
```

### repository

包代码所在位置，如`github`仓库

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Xaviw/XaviDocs.git",
    // 如果包是monorepo（多个包在一个项目下）的一部分，可以指定该包所在的目录
    "directory": "packages/react-dom"
  }
}
```

### private

如果设置为`true`，则`npm`会拒绝发布该包

### preferGlobal

设置为`true`时，如果用户安装该包未使用`--global`参数，则会显示警告
