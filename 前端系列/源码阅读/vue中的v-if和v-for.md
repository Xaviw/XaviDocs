# `vue` 中的 `v-if` 和 `v-for`

vue 中有一个经典的面试题：**`v-if` 和 `v-for` 能够一起使用吗？**

简单的回答是：

- vue2 中不可以
- vue3 中可以

再深入回答一点可能会提到两个命令优先级的问题，但不知道为什么是这样的。这篇文章从原理来理解这个问题。

## 重新认识两者优先级

我们分别使用官方提供的 [Vue Template Explorer](https://v2.template-explorer.vuejs.org/) 和 [Vue SFC Playground](https://play.vuejs.org/) 来查看 `vue2` 和 `vue3` 中对 `template` 编译后的代码。

示例代码为：

```html
<div>
  <span v-for="item of 9" :key="item" v-if="item % 2 === 0">{{ item }}</span>
</div>
```

### `vue2`

`vue2` 中编译上面代码后的结果为：

```js{5-15}
function render() {
  with (this) {
    return _c(
      "div",
      _l(9, function (item) {
        return (item % 2 === 0)
          ? _c(
              "span",
              {
                key: item,
              },
              [_v(_s(item))]
            )
          : _e();
      }),
      0
    );
  }
}
```

模板代码被编译为了 `render` 函数，其中的核心部分已经高亮显示（`_l` 函数部分）。

可以看到先用 `_l` 函数进行循环，循环产生的内容中再判断 `v-if` 的条件。如果为真创建 DOM 元素（`_c`）；如果为假创建注释元素（`_e`）。所以 `vue2` 中 `v-for` 的优先级高于 `v-if`。

另外上面的 `v-for` 代码最终只会渲染 4 个元素，但执行期间仍然完整的循环了 9 次，造成了性能浪费。这也是为什么 `vue2` 中 `v-if` 和 `v-for` 不推荐一起使用的原因。

### `vue3`

`vue3` 中编译上面代码后的结果为：

```js{15-30}
const __sfc__ = {};
import {
  renderList as _renderList,
  Fragment as _Fragment,
  openBlock as _openBlock,
  createElementBlock as _createElementBlock,
  toDisplayString as _toDisplayString,
  createElementVNode as _createElementVNode,
  createCommentVNode as _createCommentVNode,
} from "vue";
function render(_ctx, _cache) {
  return (
    _openBlock(),
    _createElementBlock("div", null, [
      _ctx.item % 2 === 0
        ? (_openBlock(),
          _createElementBlock(
            _Fragment,
            { key: 0 },
            _renderList(9, (item) => {
              return _createElementVNode(
                "span",
                { key: item },
                _toDisplayString(item),
                1 /* TEXT */
              );
            }),
            64 /* STABLE_FRAGMENT */
          ))
        : _createCommentVNode("v-if", true),
    ])
  );
}
__sfc__.render = render;
__sfc__.__file = "src/App.vue";
export default __sfc__;
```

模板代码同样被编译为了 `render` 函数，其中的核心部分已经高亮显示（`_createElementBlock` 函数第三个参数部分）。

可以看到 `vue3` 中先判断了 `v-if` 中的条件，为真时循环创建 `DOM` 元素，为假时创建注释节点。所以 `vue3` 中 `v-if` 的优先级高于 `v-for` 的优先级，解决了 `vue2` 中性能浪费的问题。

也正是因为 `vue3` 中优先处理了 `v-if`，所以导致了 `v-if` 处条件报错（从编辑器可以看到，报 `item` 不存在错误）。因为先处理 `v-if` 后模板相当于变成了：

```html
<template v-if="item % 2 === 0">
  <span v-for="item of 9" :key="item">{{ item }}</span>
</template>
```

此时 `item` 当然是不存在的。

## 总结

`vue2` 中 `v-for` 的优先级高于 `v-if`，会造成性能浪费，所以不推荐一起使用（如果开启了相关 `lint` 规则会报错，未开启的话实际上可以使用）。

`vue3` 中 `v-if` 的优先级高于 `v-for`，解决了性能浪费的问题（所以没有了相关 `lint` 规则，始终能够一起使用）。但是 `v-if` 不能使用 `v-for` 中的条件变量。

推荐始终避免同时使用 `v-if` 和 `v-for`，可以用 `computed` 属性过滤后再循环渲染，或者将 `v-for` 提升到外层标签来解决需求。
