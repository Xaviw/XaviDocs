---
hide: true
---

# monorepo 项目搭建

`monorepo` 多包项目指的是将多个项目存放在一个仓库中进行管理，并通过工具支持互相依赖。

相对于普通的一个项目一个仓库（`multirepo`），最大的好处是项目间引用更便捷，关联包更新后无需经过打包、发布、安装新版本等步骤就能够直接使用。

monorepo 有多种搭建方式，目前较为主流（`Vue3` 采用）的是使用 `pnpm` 搭建的方式。本文不是单纯的教程文，而是在 [`spatial-planning`](https://github.com/Xaviw/spatial-planning) 项目后对 `pnpm monorepo` 的一些理解。

## 基础搭建

首先需要安装 `pnpm`，推荐使用 `corepack`。安装后创建项目：

```sh
mkdir monorepo-test
cd monorepo-test
# 初始化工程化项目
pnpm init
# 使用 VSCode 打开
code .
```

::: info
项目创建后只有一个 `package.json` 文件，根据需要在文件中添加配置。另外为了避免根目录本身被作为包发布，通常还会添加 `private` 配置：

```json
{
  "type": "module", // 使用 ESM 模块
  "private": "true"
  // ...
}
```

:::

使用 pnpm monorepo 需要在根目录下新建 `pnpm-workspace.yaml` 文件：

```yaml
packages:
  - "packages/*"
```

上面的配置是指将根目录 `packages` 文件夹下的所有子文件夹都作为子项目。之后便可以创建子项目，创建后目录结构如下：

```
D:.
│   package.json
│   pnpm-workspace.yaml
│
└───packages
    ├───A
    │       index.js
    │       package.json
    │
    └───B
            index.js
            package.json
```

我们在 `B/index.js` 中导出一个变量：

```js
export const str = "this is B";
```

此时在 A 中是不能直接导入 B 并使用的，需要先将 B 作为 A 的依赖。为了安装依赖我们先给两个子项目取一个合适的包名 `@mt/a` 和 `@mt/b`，之后便可以使用 pnpm 命令将 B 作为 A 的依赖：

```sh
# 根目录下执行
pnpm -F @mt/a add @mt/b
```

::: info
包名也就是子项目 `package.json` 中 `name` 字段的值，通常使用 `@xxx/name` 的形式，将包名定义在 `@xxx` 的作用域中，避免与 `npm` 其他包重名。
:::

安装依赖后便可以在 A 中引入并执行：

```js
// A/index.js
import { str } from "@mt/b";

console.log(str);
```

```sh
# 根目录下执行
node packages/A
# 打印：this is B
```

除了 `pnpm -F` 命令，pnpm monorepo 中常用的命令还包括：

```sh
# 在根目录中执行命令，安装、卸载等命令会操作根目录的 node_modules，子项目可以直接使用根 node_modules 中的依赖
pnpm -w [command]

# 为工作区内的每一个项目执行命令
pnpm -r [command]
```

更详细的用法可以查看[官方文档](https://pnpm.io/zh/filtering)。

## 项目构建

我们知道 JS 世界的代码多种多样，有 `js`、`ts`、`jsx`、`vue` 文件等。如果 A 子包引入了 B 子包，但不能识别和使用 B 子包中的代码，那么 monorepo 也没有意义。

例如将上面 B 项目中的代码改为 TS 文件，此时由于 A 是一个 JS 项目，内部也没有处理 TS 文件的流程，所以无法正确使用，我们需要先将 B 项目打包后再使用。

可以使用 `rollup` 进行打包，为了处理 ts，还需要安装 `rollup-plugin-typescript2` 插件：

```sh
# 根目录执行
pnpm -F @mt/b add rollup rollup-plugin-typescript -D
```

再添加 `packages/B/rollup.config.js` 文件：

```js
import typescript from "rollup-plugin-typescript2";

export default {
  input: "./index.ts",
  output: {
    file: "./index.js",
    format: "esm",
  },
  plugins: [typescript()],
};
```

然后在 `packages/B/package.json` 中添加打包命令：

```json
{
  "scripts": {
    "build": "rollup -c"
  }
}
```

运行命令进行打包：

```sh
pnpm -F @mt/b build
```

::: info
打包如果出现 `Error: Cannot find module @rollup/rollup-win32-x64-msvc.` 报错，尝试运行 `pnpm -F @mt/b add @rollup/rollup-win32-x64-msvc` 进行解决
:::

我们将运行 A 的语句写为命令：

```json
// packages/A/package.json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

打包完成后再次运行 `pnpm -F @mt/a start` 可以发现能够正常运行了。但如果每次 B 模块变动都需要进行打包再使用，在开发体验上也比 Multirepo 好不到哪去，我们可以借助 [`turbo`](https://turbo.build/repo/docs) 工具解决这个问题。

## 自动构建

turbo 工具可以帮我们自动处理依赖间的关系并且执行构建，内部还使用了缓存、并行构建等多种优化方式来提升构建效率。

首先需要安装 turbo：

```sh
pnpm -w add turbo -D
```

之后在根目录插件 `turbo.json` 文件并写入如下内容作为配置文件：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "start": {
      "dependsOn": ["^build"]
    },
    "build": {}
  }
}
```

`$schema` 是用于语法提示的。`pipline` 则是 turbo 构建流水线的关键配置。

`start` 是 A 项目的启动命令，内部使用 `dependsOn` 命令声明了启动 A 需要依赖于 `build` 命令。

因为之后 B 打包完成后 `start` 才能正确运行，所以在 `build` 前添加了 `^` 符号，这表示 `start` 命令需要在 `build` 运行结束后才能够执行。

下面还声明了 `build` 命令为一个空对象，因为 turbo 需要在流水线中声明每一条语句的执行逻辑，所以用空对象表示 `build` 不需要依赖于任何其他命令。

完成上诉步骤后，我们先删除之前构建的 `packages/B/index.js` 文件，并用 turbo 命令执行 `start`：

```sh
npx turbo run start
```

会看到如下的输出：

```
➜ npx turbo run start
• Packages in scope: @mt/a, @mt/b
• Running start in 2 packages
• Remote caching disabled
@mt/b:build: cache miss, executing df96369caba9709e
@mt/b:build:
@mt/b:build: > @mt/b@1.0.0 build D:\code\monorepo-test\packages\B
@mt/b:build: > rollup -c
@mt/b:build:
@mt/b:build:
@mt/b:build: ./index.ts → ./index.js...
@mt/b:build: created ./index.js in 353ms
@mt/a:start: cache miss, executing ea9c0d0f863e92f5
@mt/a:start:
@mt/a:start: > @mt/a@1.0.0 start D:\code\monorepo-test\packages\A
@mt/a:start: > node index.js
@mt/a:start:
@mt/a:start: this is B

 Tasks:    2 successful, 2 total
Cached:    0 cached, 2 total
  Time:    1.777s
```

从输出日志能够看到先执行了 `B` 项目的 `build` 命令，并成功创建了 `index.js` 文件；之后再执行了 `A` 项目的 `start` 命令，最后完成了打印。可以尝试更改 B/index.ts 中的内容，重新运行命令后输出结果也会是正确的。

我们再创建一个 `Vue` 子项目 `C`，查看开发过程中 `turbo` 能否自动刷新：

```sh
cd packages
# 创建 Vue 项目
# 项目名设置为 C
# 包名设置为 @mt/c
# 其他配置全部选否
pnpm create vue@latest
cd C
# 安装 B 项目作为依赖
pnpm i @mt/b
# 启动项目
pnpm dev
```
