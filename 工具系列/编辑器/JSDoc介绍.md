# JSDoc 介绍

JSDoc（或 JSDoc 3）是 JS 官方的代码注释规范，可以用于生成 API 文档以及让编辑器提供类似 TS 的类型提示（TS 2.3 之后可以使用`--checkJS`标记，通过 JSDoc 对 js 文件进行类型检查）

JSDoc 注释应该放在记录代码之前，必须以 `/**` 开头，最简单的例子是单行注释描述代码：

```js
/** 这是一个函数 */
function foo() {}
```

描述更多的信息则需要使用到 JSDoc 标签，详细信息可以查看[JSDoc 中文文档](https://www.jsdoc.com.cn/)

## 块标签和内联标签

JSDoc 支持两种不同类型的标签：

- 块标签(Block), 以`@`符号开头，是一个 JSDoc 注释的最高级别
- 内联标签(inline), 也以`@`符号开头，但是必须用花括号`{}`括起来，是块标签文本中的标签或说明

块级标签间必须换行，如果要用到`{}`等关键字作为文本，则必须转义

## 常用块标签

### 类型相关

- `@type` 标识类型
- `@property` 描述类、命名空间或对象的静态属性，同`@type`

可以是 JS 内置类型或其他 namespace，通常简单类型用小写，对象数组等复杂类型用大写

单个类型：`{number}`

多个类型：`{(string | number)}`

数组类型：`{string[]}`

对象类型：`{Object.<string, number>}`，标识键为字符串值为数字的对象

对象也可以单独定义每个属性的类型：

```js
/**
 * 单独描述对象属性
 * @property {number} a
 * @property {string} b
 */
const obj = {
  a: 1,
  b: 'b',
}
```

可以为 null：`{?number}`

不能为 null：`{!number}`

任意类型：`{*}`

- `@enum` 标识一个枚举值，可以指定初始类型，每个属性可以单独指定描述以及重写类型

```js
/**
 * 状态枚举
 * @readonly
 * @enum {number}
 */
var triState = {
  /** 单独定义属性描述 */
  TRUE: 1,
  FALSE: -1,
  /**
   * 重写枚举类型
   * @type {boolean}
   */
  MAYBE: true,
}
```

- `@const` 或 `@constant` 标记一个常量，也可以指定类型
- `@default` 或 `@defaultvalue` 标识一个默认值
- `@global` 标识是一个全局变量
- `@description` 等同于上面的单行描述注释，或在多行时写在第一行
- `@deprecated` 标记已被弃用，后面可以跟描述
- `@readonly` 标记为只读

```js
/**
 * 标识RED是一个常量，默认值为0xff0000，如果default后不跟默认值也会自动识别初始赋值作为默认值
 * @constant {number}
 * @default 0xff00
 * @global
 */
const RED = 0xff0000

window.RED = RED

/**
 * @readonly
 * @description 或不用标记直接写在第一行
 * @deprecated 因为xxx已被弃用
 */
function foo() {}
```

### 函数相关

- `@function` 标记一个函数，通常用于解析器未识别为函数的情况
- `@async` 标记函数是异步的，即函数是通过 `async function foo () {}` 的方式声明的。一般 JSDoc 会自动检测函数是否是异步函数，所以通常不需要使用该标记
- `@callback` 用于描述回调函数，可以单独定义描述注释，并通过名称在其他地方使用
- `@example` 描述函数例子，可以有多个，标签后面可以添加 <caption></caption> 标签作为示例的标题，后续跟返回值以及使用示例
- `@returns` 定义返回值类型以及描述，可能为多种类型时规则同`@type`
- `@this` 描述 this 的指向，后面跟一个命名空间

```js
/**
 * 通过名称引用回调描述
 * @function
 * @async
 * @param {requestCallback} cb
 * @returns {number} 返回和
 * @example <caption>1+2=3示例</caption>
 * // returns 3
 * foo(1, 2)
 */
async function foo(a, b, cb) {
  return a + b
}

/**
 * 单独描述回调函数
 * @callback requestCallback
 * @param {number} responseCode
 * @param {string} responseMessage
 */
```

- `@param` 描述函数参数名称、类型、描述，同 `@type`

可变数量参数：`@param {...number} num`

可选参数：`@param {number} [foo]` 或者 `@param {number=} foo`

默认值：`@param {number} [foo=1]`

```js
/**
 * 函数描述
 * @param {string} a - 描述a
 * @param {Object[]} b - 对象组成的数组
 * @param {string} b[].name - 各对象中的属性
 */
function foo(a, b) {}
```

### 类相关标签

- `@class` 或 `@constructor`标记一个函数为构造函数
- `@arguments` 或 `@extends`标记一个类函数继承自哪个父类
- `@abstract` 标记方法是一个类的抽象方法，子类必须实现
- `@access xxx` 标记对象的访问级别，等同于 `@private`、`@protected`、`@package`、`@public`
-

```js
/**
 * Generic dairy product.
 * @constructor
 */
function DairyProduct() {}

/**
 * Check whether the dairy product is solid at room temperature.
 * @abstract
 * @return {boolean}
 */
DairyProduct.prototype.isSolid = function () {
  throw new Error('must be implemented by subclass!')
}
```

### 提示相关

- `@author` 标记一个项目或代码片段的作者以及电子邮箱：
- `@file` 描述本文件
- `@version` 描述版本号
- `@copyright` 描述文件的版权信息
- `@license` 描述许可证
- `@todo` 标记未完成的任务

```js
/**
 * @file 这是一个文件
 * @version 1.2.3
 * @copyright someone 2023
 * @author someone <someone@example.com>
 * @license MIT
 * @todo 还需要xxx
 */
```

- `@borrows` 复制一段描述用在多个地方，例如多个地方引用同一个函数

```js
/**
 * 表示将trstr的描述赋给trim
 * @borrows trstr as trim
 */
var util = {
  trim: trstr,
}

/**
 * Remove whitespace from around a string.
 * @param {string} str
 */
function trstr(str) {}
```

## 生成 API 文档

可以使用 JSDoc 提供的工具从已注释的代码中生成一个 HTML 网站：

```sh
npx jsdoc book.js
```

在终端运行上面的代码后，便会读取当前路径下 book.js 中的代码，并生成对应的 API 文档。更多参数查看[官网介绍](https://www.jsdoc.com.cn/about-commandline)
