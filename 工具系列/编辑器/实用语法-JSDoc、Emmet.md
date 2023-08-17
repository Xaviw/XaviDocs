# 实用语法-JSDoc、Emmet

> VSCode、HBuilderX等编辑器均已内置支持，无需额外安装插件

## JSDoc

对JS、TS代码添加描述注释，编辑器会识别并在引用处提供代码提示（类似TS类型提示）

可用于导出API文档，也可作为TS项目中JS文件的类型补充

详细查看[文档](https://www.jsdoc.com.cn/)，常用示例如下：

```TypeScript
/** 简单描述 */

/**
 * @file 用于描述文件，放在文件头部
 * @author 文件作者 <email>
 * @version 1.0.0
 */
 
/**
 * 普通类型描述
 * '*'表示任意类型
 * '?'表示可能为null
 * '!'表示不能为null
 * @type {*}
 * @type {?string}
 * @type {!number}
 */

/**
 * 某部分的详细描述
 * @desc description
 * 某部分的简要描述
 * @summary description
 */

/**
 * 标记变量
 * type类型同@type规则
 * '[]'表示非必填
 * @var [type] [name]
 * 标记常量
 * @constant [type] [name]
 */

/**
 * 标记只读
 * @readonly
 * 标记默认值
 * @default [value]
 */

/**
 * 标记一个枚举类型（对象所有值都是同一个类型）
 * 仅某个属性类型不同时可以用@type单独标记
 * @enum {type}
 */
 
/**
 * 描述对象属性
 * @property {type} defaults - description
 * @property {type} defaults.param - description
 */

/**
 * 标记函数
 * @func [name]
 */
 
/**
 * 函数示例，可以有多个
 * @example description
 * add(1,2) // return 3
 */
function add(a, b) { return a + b }
 
/**
 * 第一行可以描述函数
 * 标记默认值
 * @param {type} name=default - description
 * 标记多个属性类型，'[name]'表示参数非必填
 * @param {(type1|type2|*)} [name.param] - description
 * 表示类型为对象组成的数组，'name[].param'描述对象中属性
 * @param {object[]} [name[].param] - description
 * @returns {type} description
 */

/**
 * 创建自定义类型，用于传递给作为回调函数的参数
 * callback后续描述为自定义类型描述
 * @callback name
 * @param {number} a
 * 使用方式：
 * @param {name} a - 参数a是一个回调函数
 */

/**
 * 标记是一个构造函数
 * @class [type] [name]
 * 标记是继承得来的类
 * @extends className
 * @classdesc 对类的描述
 * @desc 类使用是是对构造函数的描述
 */

/**
 * 标记类属性
 * @member [type] [name]
 * 标记类方法
 * @method [name]
 * 标记访问范围
 * @public
 * @private
 * @protected
 * 实例属性或方法
 * @instance
 * 静态属性或方法
 * @static
 * 标记子类必须实现此方法
 * @abstract
 * 标记此方法是重写了父类同名方法
 * @override
 */

/**
 * 标记这部分代码会抛出某个异常
 * @throws {type} - description
 */

/**
 * 标记未完成事项
 * @todo description
 */
 
/**
 * 标记api已弃用
 * @deprecated description
 */

```

## Emmet

快速生成HTML结构与CSS代码块的开发工具

点击查看[官方文档](https://yanxyz.github.io/emmet-docs/)或[语法速查表](https://yanxyz.github.io/emmet-docs/cheat-sheet/)

语法中html标签、css属性支持缩写，可以在[官方仓库](https://github.com/emmetio/emmet/blob/master/snippets)中查看。也可以在项目根目录中创建snippets.json文件，添加或覆盖代码片段

### HTML语法

- 语法支持嵌套
- 语法不包含空格，会停止解析
- HTML标签名无需是标准标签
- a、img等标签生成后会有默认属性，可以手动添加覆盖默认属性

```HTML
<!-- (>)子元素：div>span -->
<div>
  <span></span>
</div>

<!-- (+)兄弟元素：div+span -->
<div></div>
<span></span>

<!-- (^)返回上一层：div>span>a^span -->
<!-- 上一层就是前一个标签生成后的结构中父级标签那一层 -->
<!-- 多个^表示往上多层：^^^返回三层 -->
<div>
  <span>
    <a href=""></a>
  </span>
  <span></span>
</div>

<!-- (*)重复：div>span*2 -->
<div>
  <span></span>
  <span></span>
</div>

<!-- (())分组：div>(header>ul>li*2>a)+footer>p> -->
<!-- 括号内为一组，后续的操作符相对于组而不是前一个标签 -->
<div>
    <header>
        <ul>
            <li><a href=""></a></li>
            <li><a href=""></a></li>
        </ul>
    </header>
    <footer>
        <p></p>
    </footer>
</div>

<!-- (#)(.)([attr=xxx])属性操作符，同CSS选择器：div#header+div.page+div[attr1=1 attr2='a b']#footer.class1.class2 -->
<!-- 自定义属性均会转换为字符串 -->
<!-- 没有空格的自定义属性可以不写引号 -->
<div id="header"></div>
<div class="page"></div>
<div attr1='1' attr2='a b' id="footer" class="class1 class2"></div>

<!-- ($)编号：ul>li.$@--$$@10-$@-20*2 -->
<!-- 单个$即递增，多个连续$为生成前导0 -->
<!-- 可以放在元素名、属性名、属性值中 -->
<!-- (@)改变编号方向及起点，需要跟在$后 -->
<!-- 不写@即升序，@-即降序 -->
<!-- @或@-后跟数字即定义起点，@-10即倒序生成，最后一个为10 -->
<ul>
  <li class="2-10-21"></li>
  <li class="1-11-20"></li>
</ul>

<!-- ({})添加文本： a{Click me}-->
<!-- 使用a>{xxx}也能达到相同的效果，但需要注意其他嵌套 -->
<a href="">Click me</a>

<!-- 隐式标签名：Emmet尝试读取上下文并生成对应的标签 -->
<!-- ul、ol内生成li -->
<!-- table、tbody、thead、tfoot内生成 tr-->
<!-- tr内生成td -->
<!-- select、optgroup内生成option -->
<!--
.wrap>.content            = div.wrap>div.content
em>.info                  = em>span.info
ul>.item*3                = ul>li.item*3
table>#row$*4>[colspan=2] = table>tr#row$*4>td[colspan=2]
-->

<!-- (lorem)生成mock字符串： p*2>lorem -->
<!-- 默认生成30个单词长的字符串，可以手动指定长度：lorem100 -->
<p>30个单词...</p>
<p>...</p>

```

### CSS语法

目前的趋势是浏览器在实现新属性时不再使用厂商前缀，而是通过特性开关来启用。这样可以避免厂商前缀带来混乱。

```CSS
/** (缩写)缩写生成：提供的CSS片段可以在上方速查表中查看，Emmet提供了模糊查找功能 */
/** ov会生成： */
overflow: hidden;

/** (-缩写)自动添加厂商前缀 */
/**
也可以显示添加部分厂商前缀：-wm-bdrs
w:webkit
m:moz
s:ms
o:o
*/
/** -bdrs会生成： */
-webkit-border-radius: ;
-moz-border-radius: ;
border-radius: ;

/** 生成渐变 */
/** lg(left, #fc0 30%, red) */
background-image: -webkit-gradient(linear, 0 0, 100% 0, color-stop(0.3, #fc0), to(red));
background-image: -webkit-linear-gradient(left, #fc0 30%, red);
background-image: -moz-linear-gradient(left, #fc0 30%, red);
background-image: -o-linear-gradient(left, #fc0 30%, red);
background-image: linear-gradient(left, #fc0 30%, red);

```
