---
sort: 15
---

# JSDoc

JSDoc 是 JS 官方的代码注释规范，还可以用于生成 API 文档，具体可以查看 [JSDoc 中文文档](https://www.jsdoc.com.cn/)。

TS 官方以 JSDoc 为基础，扩展了对 JS 代码的类型支持，使用 JSDoc 能够实现大部分 TS 的功能。

本文仅介绍 TypeScript 支持的 JSDoc 标签，和部分 TS 不支持但常用的标签。

## 检查 JS 文件

当项目中存在 `jsconfig.json` 文件，且开启了 `allowJS` 编译选项后，TS 会对这个项目进行识别。

`jsconfig.json` 文件与 `tsconfig.json` 配置基本一致，可以通过将 JS 文件添加到编译范围或在 JS 文件头加入注释 `@ts-check` 的方式对文件进行类型检查。

如果要忽略部分文件中的类型检查，可以在文件头部添加注释 `@ts-nocheck`。如果有意料之外的类型报错，可以通过在报错行前添加注释 `@ts-ignore` 来忽略 TS 类型检查。

在 JS 文件中，TS 编译器会通过上下文赋值情况来推断变量、参数等的类型，正如 TS 文件中的自动推断一样。如果类型无法自动推断则需要使用 JSDoc 来手动标注类型，否则会被当作 any 类型。

JSDoc 注释通常应该放在记录代码之前。为了被 JSDoc 解析器识别，每个注释必须以 `/**` 序列开头，星号（`*`）数量不匹配的注释将被 JSDoc 忽略。

最简单的示例就是进行描述，JSDoc 描述支持书写 MarkDown 语法：

```js
/** 单行注释 */
function fun() {}

/**
 * # 多行注释
 * - 支持 markdown 语法
 * - hover 函数名时会显示 JSDoc
 */
function foo() {}
```

::: tip
在 [TypeScript PlayGround](https://www.typescriptlang.org/zh/play) 中，可以切换配置中的 `Lang` 为 `JavaScript` 来测试 JSDoc 的使用。
:::

## 类型标签

### `@type`

`@type` 可以标记引用类型，类型可以是：

1. 原始类型，如 `string`
2. TS 声明中的类型，可以是全局声明，也可以是导入的声明
3. 在 JSDoc 中通过 `@typedef` 标记的类型

类型可以使用大多数 JSDoc 类型语法和任何 TS 语法（包括条件类型等）：

```js
/** @type {string} */
let s;

/**
 * 相当于 let n?: number
 * @type {?number}
 */
let n;

/**
 * 相当于 let b!: boolean
 * 但是js中不可为空没有实际意义，只会被识别为类型本身，这里为boolean
 * @type {!boolean}
 */
let b;

/** @type {PromiseLike<string>} */
let promisedString;

/** @type {HTMLElement} */
let myElement = document.querySelector(selector);

/** @type {string | boolean} */
let sb;

/** @type {{ a: string, b?: number }} */
let var9;

/**
 * @type {*} - 相当于any类型
 */
let star;

/**
 * @type {?} - 相当于 unknown 类型，效果等同于 any
 */
let question;
```

::: warning 注意
在 JS 中使用可选类型 `@type {?type}` 或联合类型 `type | null` 时，只有开启了 `strictNullChecks` 编译选项才有意义，否则类型不会包括 null 的情况
:::

指定数组类型有多种语法：

```js
/** @type {number[]} */
let ns;
/** @type {Array.<number>} */
let jsdoc;
/** @type {Array<number>} */
let nas;
```

可以使用 JSDoc 对象语法定义索引类型：

```js
/**
 * 键为字符串，值为数字的索引类型，相当于：
 * { [key: string]: number }
 *
 * @type {Object.<string, number>}
 */
let stringToNumber;
```

指定函数类型有两种语法：

```js
/** @type {function(string, boolean): number} */
let sbn;

/** @type {(s: string, b: boolean) => number} */
let sbn2;
```

JSDoc 可以使用强制转换语法，通过**在任何带括号的表达式之前添加标记**来将类型转换为其他类型：

```js
/**
 * @type {number | string}
 */
let numberOrString = Math.random() < 0.5 ? "hello" : 100;

// 用 JSDoc 语法，将 numberOrString 强制定义为 number 类型
let typeAssertedNumber = /** @type {number} */ numberOrString;
```

甚至可以像 TypeScript 一样断言为常量类型：

```js
let one = /** @type {const} */ (1);
```

从类型声明文件中导入类型是特定于 TS 环境中的功能，JSDoc 中本不支持。：

::: code-group

```js [main.js]
/**
 * 可以正确导入并使用类型
 * @param {import("./types").Pet} p
 */
function walk(p) {
  console.log(`Walking ${p.name}...`);
}
```

```ts [types.d.ts]
export type Pet = {
  name: string;
};
```

:::

### `@param` 和 `@returns`

`@param` 和 `@returns` 与 `@type` 使用相同的类型语法，但需要添加参数名称。也可以通过方括号将名称括起来声明为可选参数：

```js
/**
 * @param {string}  p1 - p1 描述
 * @param {string=} p2 - Google Closure 语法的可选参数
 * @param {string} [p3] - JSDoc 语法的可选参数
 * @param {string} [p4="test"] - 带默认值的可选参数
 * @returns {string} - 返回值描述
 */
function stringsStringStrings(p1, p2, p3, p4) {
  // TODO
}
```

`@param` 还允许定义对象类型中的属性类型，嵌套属性名称必须以参数名称为前缀；以及定义构造函数类型和剩余参数（rest parameters）类型：

```js
/**
 * @param {Object} options - 对象属性 options
 * @param {string} options.prop1 - options 中包含字符串属性 prop1
 * @param {number} [options.prop2] - options 中包含可选数字属性 prop2
 * @param {{new(): object}} c - 参数 c 是一个构造函数
 * @param {...string} d - 后续支持任意多个字符串参数，d 的类型为 string[]
 */
function special(options, c ...d) {
  // ...
}
```

### `@typedef`

`@typedef` 可以在 JS 文件中配合 `@property`（简写 `@prop`） 自定义类型：

```js
/**
 * @typedef {Object} SpecialType - 创建名为 SpecialType 的对象类型
 * @property {string} prop1 - 字符串属性 prop1
 * @property {number=} prop2 - 可选的数字属性 prop2
 * @prop {number} [prop3] - 可选的数字属性 prop3
 * @prop {number} [prop4=42] - 默认值为 42 的可选属性 prop4
 */

/** @type {SpecialType} */
var specialTypeObject;
```

可以为导入的类型声明别名：

```js
/**
 * @typedef {import("./types").Pet} P
 */
```

### `@callback`

`@calback` 用于定义函数类型，类似于 `@typedef`：

```js
/**
 * @callback Predicate - 创建名为 Predicate 的函数类型
 * @param {string} data - 字符串类型参数 data
 * @param {number} [index] - 可选的数字类型参数 index
 * @returns {boolean} - 返回布尔值
 */

/** @type {Predicate} */
const ok = (s) => !(s.length % 2);
```

这样的函数类型也可以通过 `@typedef` 定义：

```js
/** @typedef {(data: string, index?: number) => boolean} Predicate */
```

### `@template`

`@template` 可以用来创建泛型参数：

```js
/**
 * @template T - 创建泛型 T
 * @param {T} x
 * @returns {T}
 */
function id(x) {
  return x;
}

const a = id("string");
const b = id(123);
const c = id({});
```

使用逗号或多个标记声明多个类型参数，还可以在类型参数名称之前指定类型约束以及为类型参数指定默认值：

```js
/**
 * @template {{ serious(): string }} Seriousalizable - 约束 Seriousalizable 必须有返回字符串的  serious 方法
 * @template {string} [K="abc"] - 约束 K 必须是 string 的子类型，默认为字符串 ”abc“
 * @param {Seriousalizable} object
 * @param {K} key
 */
function seriousalize(object, key) {
  // TODO
}
```

### `@satisfies`

`@satisfies` 提供 TS 中 [Satisfies 运算符](./类型运算#satisfies-运算符)的功能，用于声明值实现类型，但不影响值的类型推断：

```js
/** @typedef {{ url: string | string[]}} T */

/**
 * 要求 a 的值需要满足 T 类型
 *
 * @satisfies {T}
 */
const a = { url: "www.xxx.com" };

// 根据赋值推断为字符串，所以可以正确调用
// 如果上面改为 @type，则这里会报错
a.url.toUpperCase();
```

## 类标签

JSDoc 提供了 `@private`、`@protected`、`@public`、`@readonly` 修饰符，它们的功能与 TS 中的 `private`、`protected`、`publick`、`readonly` 关键字一样。

### `@override`

ts 中开启了 `noImplicitOverride` 编译选项时，会要求子类只能重写基类中存在的方法，且重写方法前必须添加 `override` 关键字。JSDoc 中的 `@override` 与 `override` 关键字作用一致：

```js
export class C {
  m() {}
}
class D extends C {
  /** @override */
  m() {}
}
```

### `@extends`

当继承一个泛型基类时，可以用 `@extends` 传递泛型：

```js
/**
 * @template T
 * @extends {Set<T>}
 */
class SortableSet extends Set {
  // ...
}
```

### `@implements`

`@implements` 功能等同于 TS 中的 `implements` 关键字，用于指定类实现的类型：

```js
/** @implements {Print} */
class TextBook {
  print() {
    // TODO
  }
}
```

### `@constructor`

TS 编译器会提供类中的初始值以及构造函数中的 this 赋值推断构造函数类型，但也可以使用 `@constructor` 准确标记类型（主要用于构造函数语法，class 语法中可以直接声明 constructor 函数的类型）：

```js
/**
 * 标记是一个构造函数，并指定参数类型
 *
 * @constructor
 * @param {number} data - 数字类型的参数 data
 */
function C(data) {
  this.data = data;
}

// class 语法不需要 @constructor
class C {
  /** @param {number} data */
  constructor(data) {
    this.data = data;
  }
}
```

### `@this`

可以通过 `@this` 显示指定上下文可用的类型：

```js
/**
 * @this {HTMLElement}
 * @param {*} e
 */
function callbackForLater(e) {
  this.clientHeight = parseInt(e);
}
```

## 文档标签

### `@deprecated`

标记某个函数、方法或属性被弃用：

```js
/** @deprecated */
const apiV1 = {};
```

> 被弃用的值在编辑器中的代码提示中通常以删除线的形式显示

### `@see`

允许链接到程序中的其他类型，链接后 hover 类型名称后编辑器会显示类型定义，以及提供跳转功能等：

```js
/**
 * @template T
 * @typedef {{t: T}} Box
 */

/**
 * @see Box 编辑器中鼠标放在 Box 上会显示具体的类型定义
 * @template T
 * @typedef {{ [K in keyof T]: Box<T> }} Boxify
 */
```

### `@link`

`@link` 与 `@see` 作用类似，但是可以用在其他标签中：

```js
/**
 * @template T
 * @typedef {{t: T}} Box
 */

/**
 * @template T
 * @param {T} u
 * @returns {Box<T>} A {@link Box}
 */
function box(u) {
  return { t: u };
}
```

如果上面的 `@link` 改为 `@see` 则 hover 时不会显示类型定义

## 其他标签

### `@enum`

`@enum` 允许创建类似 TS 中的枚举类型，但区别是 `@enum` 可以指定值为任何类型，且所有成员只能是相同类型：

```js
/** @enum {function(number): number} */
const MathFuncs = {
  add1: (n) => n + 1,
  id: (n) => -n,
  sub1: (n) => n - 1,
};

MathFuncs.add1;
```

### `@author`

指定项目作者以及邮箱，可以用在文件开头：

```js
/**
 * Welcome
 * @author xavi <xaviw@foxmail.com>
 */
```

> 注意将邮箱用尖括号括起来，否则@后会被识别为新标签

## TS 不支持的常用标签

### `@default`

配合 `@constant` 标签使用，可以标识一个值为常量类型：

```js
/**
 * 此时 RED 的类型为 0xff0000
 * @constant
 * @default
 */
const RED = 0xff0000;
```

也可以标记一个变量的默认值（非规范用法，仅 hover 时会显示写的注释）：

```js
/** @default 1 */
let x;
```

### `@example`

提供使用示例，一条注释中可以有多个 `@example` 标签，标签后还可以添加 `<caption>xxx</caption>` 标签作为示例标题。`@example` 后连续的多行文本会在 hover 时一行显示，直到遇见空行或其他标签：

```js
/**
 * @example <caption>示例1</caption>
 * // returns 2
 * globalNS.method1(5, 10);
 *
 * @example
 * // returns 3
 * globalNS.method(5, 15);
 *
 * @returns {Number}
 */
globalNS.method1 = function (a, b) {
  return b / a;
};
```

### `@version`

标识某段代码的版本：

```js
/**
 * 描述
 * @version 1.2.3
 */
function solver(a, b) {
  return b / a;
}
```

### `@todo`

记录未完成的任务，一个注释块中可以有多个 `@todo` 标签：

```js
/**
 * @todo Write the documentation.
 * @todo Implement this function.
 */
function foo() {
  // write me
}
```

### `@tutorial`

插入一个教程链接，一个注释块中可以多次使用：

```js
/**
 * Description
 * @class
 * @tutorial tutorial-1
 * @tutorial www.xxx.com
 */
function MyClass() {}
```

### `@copyright`

用来描述一个文件的版权信息，一般和 `@file` 标签结合使用：

```js
/**
 * @file 这是一段文件描述
 * @copyright 版权信息
 */
```

### `@license`

标记应用于代码任何部分的软件许可证：

```js
/**
 * 描述
 * @license Apache-2.0
 */
```
