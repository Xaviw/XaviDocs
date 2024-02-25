# 对 dts 文件以及类型解析的理解

## tsconfig.json 的作用

在 ts 项目的根目录下都有一个 tsconfig.json 文件，按照官方的说法`当目录中出现了 tsconfig.json 文件，则说明该目录是 TypeScript 项目的根目录。tsconfig.json 文件指定了编译项目所需的根目录下的文件以及编译选项。`

tsconfig.json 配置主要分为几类：

```json
// tsconfig.json
{
  "include": [], // 需要编译的文件列表，值为 glob 表达式
  "files": [], // 需要编译的文件列表，只编译少数文件时替代 include 使用
  "exclude": [], // 无需编译的文件列表，值为 glob 表达式，与 include 配合使用
  "references": [], // 项目引用，将应用在ts层面拆分位多个小型应用，可以查看 https://www.tslang.cn/docs/handbook/project-references.html
  "extends": "", // 从其他文件继承配置，需要注意 tsconfig 中的相对路径均是相对于 tsconfig 文件本身，而不是被继承后的文件路径
  // 编译器选项
  "compilerOptions": {
    // ...
  },
  // 一般无需配置
  "watchOptions": {},
  "typeAcquisition": {}
}
```

我们知道 typescript 库可以编译 ts 文件，并输出编译后的 js 文件以及类型文件

```sh
npm i -g typescript

tsc index.ts
```

使用 tsc 命令进行编译时实际上就是读取了 tsconfig.json 中的配置对 ts 文件进行解析并输出。而 incldue、files、exclude 配置就是代替了 tsc 命令中的文件路径参数，便于批量编译 ts 文件

除了指定编译范围的 include、files、exclude 和继承配置选项 extends 外，我们主要关注编译选项 compilerOptions

compilerOptions 中的配置可以按[功能分类](https://www.typescriptlang.org/tsconfig)，主要包括：

- 类型检查配置，如 strict
- 模块解析配置，如 module
- 输出配置，如 declaration
- js 支持配置，如 allowJs
- 不同模块互相操作约束配置，如 esModuleInterop
- 向后兼容配置，如 noStrictGenericChecks
- 语言、环境配置，如 jsx
- 项目配置，如 composite
- 完整性配置，如 skipLibCheck

无论是使用打包器打包 ts 应用(例如 Rollup、Vite)，还是编辑器提供的类型提示(例如 VSCode)，都是读取编译范围中的文件后（`默认包括 .ts、.d.ts、.tsx 文件，设置 allowJs 后还包括 .js、.jsx`），再根据编译选项对文件进行编译后完成的，所以需要正确配置 tsconfig.json

本文不对具体的配置做介绍，推荐在实际使用时参考知名的库或者在 [github.com/tsconfig/bases](github.com/tsconfig/bases) 上寻找一个合适的基本配置，需要理解更具体的含义时再查看[编译器选项](https://www.typescriptlang.org/tsconfig#compiler-options)列表

### Vite+Vue 模板的 tsconfig.node.json 文件的作用

使用 `npm create vite` 创建 Vue3 应用时，会发现根目录中增加了一个 tsconfig.node.json 文件，并在 tsconfig.json 中通过 references 配置引用

这是因为 vue 应用是在浏览器中运行，而 vite.config.ts 文件在 node 环境中运行，按理二者应该使用不同的 tsconfig 配置([查看 Issue](https://github.com/vitejs/vite/issues/2031))

所以 tsconfig.json 中通过 references 引用了 tsconfig.node.json 文件，这会将 tsconfig.node.json 当作一个子应用单独编译，而 tsconfig.node.json 中编译范围只包含 vite.config.ts ，这就实现了 vite.config.ts 文件使用不同的 tsconfig 配置

对于 tsconfig.node.json 的文件名，我们可以任意取名，只需要在 tsconfig.json references 中正确链接即可

## .d.ts 文件的作用

> 一个完整的 ts 项目中通常会有较多的 .d.ts 文件，分别存在于项目自身创建的文件、依赖库中的文件、以及单独的 @types/xxx 依赖中
>
> 使用 tsc 编译后会生成 .d.ts 文件，相应的 .d.ts 文件就是专门用来声明类型的。.d.ts 文件中可能会有些 `declare、namespace、export、export =`等语法，不熟悉的同学大概率会比较懵

对于自己书写的文件，ts 会处理编译范围配置中的文件，并

例如使用 jQuery 时，ts 并不知道 `$` 或 `jQuery` 是什么东西，这就需要我们声明类型。除了自己声明外还可以通过 `npm i -D @types/jquery` 来安装第三方声明到项目 .node_modules/@types 下。而例如 vue 的库，其内部在 package.json 中指定了 types 字段，并存在对应的声明文件，所以无需再安装或手动声明类型

在通过 import 导入一个包时(例如 foo)，编译器会查找这个包是否存在对应的声明文件：

1. 查找 package.json 文件中是否有 types 字段，查找 types 字段对应的文件或 index.d.ts 文件或 foo.d.ts 文件
2. 查找 .node_modules/@types/foo 是否存在

以上两种方式均未找到类型声明后，就需要自己写声明文件。通常我们会创建一个 types 目录，将声明放在 types/foo/index.d.ts 中，在 .d.ts 中含有 import、export 语法时，文件会被识别为模块声明，导出语法可以查看[教程](https://ts.xcatliu.com/basics/declaration-files.html#%E4%B9%A6%E5%86%99%E5%A3%B0%E6%98%8E%E6%96%87%E4%BB%B6)

这种方式还需要配置 tsconfig.json 中的 baseUrl 和 paths 字段：

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "foo": ["types/foo"]
    }
  }
}
```

这样当导入 foo 时，编译器就会在 types/foo 下寻找声明文件，并提供类型提示

而对于没有 import、export 语法的 .d.ts 文件，则会被识别为全局类型声明，语法可以查看[教程](https://ts.xcatliu.com/basics/declaration-files.html#%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F)

上文提到了 typescript 默认会识别编译范围配置内的 .d.ts 文件，所以 VSCode 识别完项目编译范围内的 .d.ts 文件后就能够将类型与对应的变量或者模块对应上，当使用这些变量或模块时我们就能够得到类型提示
