---
hide: false
---

# monorepo 项目搭建

`monorepo` 多包项目指的是将多个项目存放在一个仓库中进行管理，并通过工具支持互相依赖。

相对于普通的一个项目一个仓库（`multirepo`），monorepo 最大的好处是项目间引用更便捷，关联包更新后无需经过打包、发布、安装等步骤就能够直接使用。

monorepo 有多种搭建方式，目前较为主流（`Vue3` 采用）的是使用 `pnpm`。本文不是完整的教程文，而是在 [`spatial-planning`](https://github.com/Xaviw/spatial-planning) 项目后对 `pnpm monorepo` 的一些理解。

## 基础搭建

首先需要安装 [`pnpm`](https://pnpm.io/zh/)，推荐使用 [`corepack`](https://nodejs.cn/api/corepack.html)。安装后创建测试项目：

```sh
mkdir monorepo-test
cd monorepo-test
# 初始化工程化项目
pnpm init
# 使用 VSCode 打开
code .
```

::: info
项目创建后只有一个 `package.json` 文件，monorepo 项目为了避免根目录被作为包发布，通常会添加 `private` 配置，同时我们将项目模块方式设置为 `ESM`：

```json
{
  "type": "module", // 使用 ESM 模块
  "private": "true"
  // ...
}
```

:::

使用 pnpm monorepo 要求在根目录下新建 `pnpm-workspace.yaml` 文件：

```yaml
packages:
  - "packages/*"
```

上面的配置是指将根目录 `packages` 文件夹下的所有子文件夹都作为子项目。之后便可以创建子项目，创建后目录结构如下：

```
monorepo-test
├─ package.json
├─ pnpm-workspace.yaml
└─ packages
   ├─ A
   │  ├─ index.js
   │  └─ package.json
   └─ B
      ├─ index.js
      └─ package.json
```

我们在 `B/index.js` 中导出一个变量：

```js
export const str = "this is B";
```

此时 A 如果想导入 B 并使用，需要先将 B 作为 A 的依赖。为了安装依赖我们先给两个子项目取一个合适的包名 `@mt/a` 和 `@mt/b`，之后便可以使用 pnpm 命令将 B 安装为 A 的依赖：

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

`pnpm -F` 命令是筛选（`filter`）具体的项目并在内部执行命令，除此之外 pnpm monorepo 中常用的命令还包括：

```sh
# 在根目录中执行命令，安装、卸载等命令会操作根目录的 node_modules，子项目可以直接使用根 node_modules 中的依赖
pnpm -w [command]

# 为工作区内的每一个项目执行命令
pnpm -r [command]
```

更详细的用法可以查看[官方文档](https://pnpm.io/zh/filtering)。

## 项目构建

我们知道 JS 世界的代码多种多样，有 `js`、`ts`、`jsx`、`vue` 文件等。而 monorepo 只是一种项目组织方式，项目间相互引用还是等同于包之间的引用。

所以如果将上面 B 项目中的代码改为 TS 文件，由于 A 是一个 JS 项目便无法正确使用，此时需要先将 B 项目打包后再使用。

对于库的打包，通常使用 `rollup`，为了处理 ts，还需要安装 `rollup-plugin-typescript2` 插件：

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
    "build": "rollup -c" // -c 指定配置文件，默认为 rollup.config
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

我们将运行 A 的语句也写为命令：

```json
// packages/A/package.json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

打包完成后运行 `pnpm -F @mt/a start` 可以发现能够正常运行了。

只是两个子项目时，手动执行打包再执行运行尚能接受。但当子项目变多，依赖关系变复杂时，手动执行就体现不出 monorepo 的优势了。为了解决这个问题我们可以借助 `turbopack` 工具。

## 构建流水线

[`turbopack`](https://turbo.build/repo/docs) 基于 `Rust` 构建，使用高度优化的机器代码和低层级增量计算引擎，可以缓存到单个函数的级别。除了速度快 `turbopack` 还提供了 `pipeline`，可以自定义项目命令间的依赖关系，由工具自己处理构建流程。

首先需要进行安装：

```sh
pnpm -w add turbo -D
```

之后在根目录创建 `turbo.json` 文件并写入如下内容作为配置文件：

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

`$schema` 用于语法提示，`pipline` 则是 turbo 构建流水线的关键配置。

`start` 是 A 项目的启动命令，内部使用 `dependsOn` 命令声明了启动 A 需要依赖于 `build` 命令。

因为只有在 B 打包完成后 `start` 才能正确运行，所以在 `build` 前添加了 `^` 符号，这表示 `start` 命令需要在 `build` 运行结束后才能够执行。

下面还声明了 `build` 命令为一个空对象，因为 turbopack 需要在流水线中声明每一条语句的执行逻辑，所以用空对象表示 `build` 不需要依赖于任何其他命令。

完成上诉步骤后，我们先删除之前构建的 `packages/B/index.js` 文件，然后使用 turbopack 运行 start 命令：

```sh
# 根目录
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

从输出日志能够看到先执行了 `B` 项目的 `build` 命令，并成功创建了 `index.js` 文件；之后再执行了 `A` 项目的 `start` 命令，最后完成了打印。可以尝试更改 `B/index.ts` 中的内容，重新运行命令后输出结果也会是正确的。

turbopack 提供的构建流水线解决了需要手动按顺序执行多个命令的问题，但子项目内容修改后还是需要执行命令完成打包流程后才能使用。为了优化体验我们还可以使用 `unbuild` 工具，它提供了**“插桩”**功能，可以动态的执行最新代码，而不需要多次打包。

## 自动构建

[`unbuild`](https://github.com/unjs/unbuild) 是一个基于 `rollup` 的构建工具，内部集成了 rollup 生态中众多优秀的插件，可以零配置对代码进行打包。unbuild 还提供了插桩功能，在打包后生成带有 [`jiti`](https://github.com/unjs/jiti) 的包，执行代码时由 jiti 动态执行最新的源码。

还是以上面的项目为例，在 B 项目中使用 unbuild 进行打包，首先安装 unbuild：

```sh
pnpm -F @mt/b add unbuild -D
```

> 使用 unbuild 后 rollup 可以不再使用

unbuild 默认将 `scr/index` 作为入口文件，打包后输出为 `dist/index.mjs`。所以我们将 `B/index.ts` 移动到 `B/src/index.ts`，然后修改 `package.json` 中的 `main` 配置（`main` 就是包被引用时默认查找的文件），并重写打包命令：

::: info
也可以创建 build.config 配置文件，配置选项可以查看[文档](https://github.com/unjs/unbuild?tab=readme-ov-file#usage)
:::

```json
// B/package.json
{
  "main": "./dist/index.mjs",
  "scripts": {
    "build": "unbuild",
    "stub": "unbuild --stub"
  }
}
```

::: info
`.mjs` 后缀也就是 ESModuleJS 文件的意思，对应的 CommonJS 文件后缀为 `.cjs`。设置这两种后缀后编译器会忽略 `package.json` 中的 `type` 配置，使用对应的模块解析方式解析文件。
:::

`build` 命令作为正式打包的命令，会输出正确的打包后文件。`stub` 命令作为开发时打包命令，输出 `jiti` 包，可以避免重复打包。

build 命令这里就不测试了，我们直接让 A 项目的 start 命令依赖于 stub 命令：

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {},
    "stub": {},
    "start": {
      "dependsOn": ["^stub"]
    }
  }
}
```

之后运行 `start` 命令：

```sh
# 根目录
npx turbo run start
```

运行后可以看到 `B/dist/index.mjs` 顺利生成了带有 `jiti` 的包，而且 `A` 项目的打印也成功执行了。

可以修改 `B/src/index.ts` 中的内容，然后单独执行 A 项目的 start 命令，查看打印结果是否变化：

```sh
# 根目录
pnpm -F @mt/a start
```

可以看到单独执行 `A` 项目的 `start` 命令，也成功输出了改动后的值。这说明 `jiti` 插桩起作用了。

## 子项目并不是必须打包

上面我们提到了如果 `A` 无法识别 `B` 的代码，那么需要先将 `B` 打包后再使用。对应的如果 `A` 能够识别 `B` 的代码，那么 `B` 也可以不打包。

例如 `A` 是一个 `Vue` 项目的话，运行 `A` 需要经过 `Vite`（或其他打包器）启动，启动和运行过程中 `Vite` 就会对 `ts`、`vue` 等代码进行处理，就算 `B` 没有打包也能够正常引入并使用。

减少一次打包流程，对开发体验来说也会有比较明显的提升。所以在 monorepo 项目中，需要从子项目作用范围，用途等多方面考虑是否需要进行打包，并选择合适的方案。

## TypeScript 使用

在 `monorepo` 项目中使用 `TypeScript` 时，如果所有子项目都只会用在同样的环境中，那么可以只在根目录创建一份 `tsconfig.json` 文件，作用到每一个子项目。

但是通常各个子项目并不会都运行在一个环境，例如浏览器端项目可能需要开启 `DOM lib`，需要开启 `jsx` 等，而服务端项目往往不需要这些配置。

所以推荐为每一个子项目都创建各自的 `tsconfig.json` 文件，可以复用的配置抽离在根目录文件中，然后各个子项目使用 `extends` 进行复用。

如果多个子项目需要复用类型接口，同样可以将类型写在根目录中。例如：

::: code-group

```[项目结构]
monorepo-typescript
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.common.json
├─ types
│  └─ common.d.ts
└─ packages
   └─ A
      ├─ index.ts
      ├─ tsconfig.json
      └─ package.json
```

```json [tsconfig.common.json]
{
  "compilerOptions": {
    "paths": {
      "#/*": ["./types/*"]
    }
  }
}
```

```json [A/tsconfig.json]
{
  "extends": "../../tsconfig.common.json",
  "include": ["index.ts", "../../types/*"]
}
```

```ts [A/index.ts]
// 可以直接导入使用
// types 文件夹中的全局类型也可以直接使用
import { AnyType } from "#/common";
```

:::

## 环境变量使用

许多库都提供了对环境变量的支持，但基本只能用在项目自身。如果 monorepo 中想共用一份环境变量，可以使用 `dotenv-cli` 库在启动命令中注入环境变量。

首先进行安装：

```sh
pnpm -w add dotenv-cli -D
```

之后创建环境变量文件 `.env`、`.env.local`、`.env.development`、`.env.development.local`。

使用时在启动命令中添加参数（以 Nest 为例）：

```json
// package.json
{
  "scripts": {
    "dev": "dotenv -e .env -c -e .env.development -c -- nest start --watch"
  }
}
```

上面的命令中使用 dotenv 注入环境变量，`-e` 参数指定环境变量文件路径，路径后的 `-c` 参数表示同时读取文件的 `.local` 版本。

多个环境变量文件需要分别书写，注入环境变量后使用 `--` 分隔不同的命令，不然后面的 `nest start` 会被识别为命令参数。

::: info
部分库支持自定义环境变量文件位置，例如 Vite 提供了 envDir 配置参数，此时更推荐使用库自身配置。
:::
