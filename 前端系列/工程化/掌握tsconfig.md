# 掌握js/tsconfig.json

如果你使用`VSCode`，通常每个项目根目录下都会有一个`jsconfig.json`或`tsconfig.json`文件，那这个文件的作用是什么呢？

按[官方文档](https://code.visualstudio.com/docs/languages/jsconfig)的解释来说，`jsconfig.json`标记该目录是`JS`项目根目录，并根据内部配置为项目内的`JS`文件提供语言服务支持（例如`api`提示、导入路径提示等）

因为`ts`文件解析相关配置`compilerOptions`无需在`js`项目中配置，所以官方称`jsconfig`属于`tsconfig`的子集

## 为什么需要

1. 没有`jsconfig.json`时，`VSCode`将每个`JS`文件都看作独立的单元。只要两个文件间没有通过模块导入语句显示的引用，这两个文件就没有公共的项目上下文
2. 有`jsconfig.json`时，配置的属性会作用到项目内的每个`JS`文件，例如可以选择性的列出语言服务需要支持哪些文件或不支持哪些文件

简单来说就是有了`jsconfig.json`文件后，设置的`include`、`exclude`等属性能够约束语言服务的作用范围。例如在`a.js`中使用`console.log(b)`时，因为文件上下文中没有`b`，所以编辑器提供的语言服务会去查找有没有哪一个文件导出了`b`，如果项目非常巨大的话，全目录查找效率会很低下，这时候就需要`jsconfig.json`来指定哪部分文件才是需要查找的，从而提高编辑器效率

<hr />

在`ts`项目中，我们知道可以用`typescript`库提供的`tsc`命令编译输出`js`文件，少量文件编译可以通过参数指定编译选项，但如果编译整个项目则需要利用`tsconfig.json`来指定编译选项，同时统一编译策略也利于团队协作开发

## 创建文件

`js/tsconfig.json`文件可以手动创建，在vscode中通过触发建议快捷键即可出现可用字段

`tsconfig.json`还可以通过`tsc init`命令生成（需要先安装`typescript`包），生成的内容只有`compilerOptions`字段，并开启了几个常用属性，其他属性也通过注释做了详细的解释

`js/tsconfig.json`文件可以是个空文件，只要创建了这个文件，所在目录就会被识别为项目根目录，相关属性会使用默认值

> `tsc`命令行中指定的选项会始终覆盖`tsconfig.json`中的对应配置

## 通用属性

### include

指定允许被识别的文件或文件夹列表，运行使用通配符：

- `*`匹配0个或多个字符（不包括目录分隔符）
- `?`匹配任意一个字符（不包括目录分隔符）
- `**/`匹配任意一级或多级目录

如果路径某一部分只包含`*`或`.*`，那么这部分只会匹配支持的扩展名（`.ts`、`.tsx`、`.d.ts`，如果设置了`allowJs`则还包括`.js`和`.jsx`）

### files

指定允许被识别的文件列表，如果找不到对应文件会报错

用于只有少量文件需要被识别时取代`include`，`files`与`include`也可以同时存在。另外`files`指定的文件不会被`exclude`排除

### exclude

指定不应该被识别的文件或文件夹列表，同样可以使用通配符

`exclude`会默认排除`node_modules`、`bowser_components`、`jspm_packages`和`outDir`属性指定的目录

::: tip
未指定时，`include`默认值为`["**/*"]`；`files`、`exclude`默认为`[]`
:::

### extends

```json
{
  "extends": "./anotherConfig.json"
}
```

继承另一个配置文件中的配置，路径匹配规则采用`NodeJS`匹配规则（[JS模块化原理](/前端系列/工程化/JS模块化原理#模块匹配规则)中有详细说明）。主配置文件中的配置属性会覆盖`extends`指定文件中的属性，对象中的不同属性会合并后作为完整的配置。多个配置文件不能通过`extends`属性循环引用

需要注意`files`、`include`、`exclude`字段不会发生合并，优先使用主配置文件中的配置

### watchOptions

### vueCompilerOptions

## TS相关属性

### compilerOptions

`compilerOptions`是`TS`配置的主要部分

#### allowUnreachableCode

定义如何处理不会被访问到的代码，默认`undefined`表示展示警告，还支持`true`表示忽略，`false`表示报错。例如：

```ts
function fn(n: number) {
  if (n > 5) {
    return true;
  } else {
    return false;
  }
  // 下面的代码永远不会被执行到
  return true;
}
```

#### allowUnusedLabels

定义如何处理未使用的标签，规则同`allowUnreachableCode`。标签语法并不常用，若不了解可以参考[MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/label)

#### alwaysStrict

是否将每个文件都看作开启严格模式(`use strict`)，在`ESModule`文件中会默认开启，具体规则可以参考[MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)

#### exactOptionalPropertyTypes

是否需要精确定义可选属性类型。默认`TS`可选属性可以为`undefined`，如果开启此选项则不会默认支持`undefined`

#### noFallthroughCasesInSwitch

是否需要`switch`语句中每个非空`case`都包含`break`或`return`

#### noImplicitAny

是否允许不明确类型的变量存在。例如函数参数如果未指定类型，`TS`会将类型看作`any`，该属性定义是否允许这种默认的回退类型行为

#### noImplicitOverride

开启后子类重写父类方法必须添加`override`关键字:

```ts
class Son extends Father {
  override func() {}
}
```

#### noImplicitReturns

启用后将严格检查函数是否有明确的返回值（默认的返回`undefined`会报错）

#### noImplicitThis

开启后对`this`类型无法识别时（隐式`any`类型）会报错，例如：

```ts
class Name {
  firstName: '';
  lastName: '';

  outputName(){
    return function(){
      // 这个函数中的this在调用时才能确定，而不是Name类，会报错
      return this.firstName + this.lastName
    }
  }
}
```

#### noPropertyAccessFromIndexSignature

开启后将不能用点语法(`obj.attr`)访问对象中通过索引定义的属性：

```ts
let obj:{a: number, [key:string]: string} = {a: 1}
// 开启noPropertyAccessFromIndexSignature后将报错
console.log(obj.b)
```

#### noUncheckedIndexedAccess



### buildOptions

### compileOnSave

### references

### typeAcquisition

### ts-node


