# Vue3 Provide/Inject 使用指南

Provide 与 Inject API 提供了跨层级传递数据的功能，便于更灵活的组织代码。但这种灵活性也容易伴随着容错性降低，比如：

- 注入名称容易拼错，或取名困难
- 需要在代码见反复横跳查看注入的内容
- 有可能意外的注入了同名的内容，导致数据相互覆盖
- 获取的注入未必存在，需要做空值或默认值处理

## 使用方式

最简单的注入使用方式为：

::: code-group

```ts [fateher.vue]
import { provide } from 'vue'

provide('name', { key: 'value' })
```

```ts [son.vue]
import { inject } from 'vue'

const obj = inject('name')
```

:::

基础的使用很简单，但如果项目工程较大就会容易出现一些问题

## 注入名冲突

取名是程序员公认较为头痛的问题，注入这种跨组件的功能取名更是

如果一个`祖-父-子`层级关系的组件中，祖先组件和父组件均 provide 了名为 account 的数据，那么子组件中将不能正确拿到祖先组件提供的数据

此时当然能根据修改注入名避免这些问题，但明显不是一个足够好的方案。我们可以通过统一管理、提供诸如名的方式来避免注入名重复，还可以利用 Symbol 的能力，来避免取名困难的问题

根据自己习惯，创建 `src/constants/injection-keys.ts` 文件来管理诸如名：

```ts
export const GrandAccountKey = Symbol('account')

export const FatherAccountKey = Symbol('account')
```

使用时：

::: code-group

```ts [grand.vue]
import { provide } from 'vue'
import { GrandAccountKey } from '@/constants/injection-keys'

provide(GrandAccountKey, { id: '1', name: 'grand' })
```

```ts [father.vue]
import { provide } from 'vue'
import { FatherAccountKey } from '@/constants/injection-keys'

provide(FatherAccountKey, { id: '2', name: 'father' })
```

```ts [son.vue]
import { inject } from 'vue'
import { GrandAccountKey } from '@/constants/injection-keys'

const account = inject(GrandAccountKey) // { id: '1', name: 'grand' }
```

:::

## 注入提示

如果没有注入提示，常常需要在多个代码文件中反复横跳查看具体数据，体验十分不友好，官方推荐使用 TS 提供类型提示

```ts
import { InjectionKey } from 'vue'

export interface Account {
  name: string
  id: string
}

export const GrandAccountKey: InjectionKey<Account> = Symbol('account')

export const FatherAccountKey: InjectionKey<Account> = Symbol('account')
```

使用时：

::: code-group

```ts [grand.vue]
import { provide } from 'vue'
import { GrandAccountKey } from '@/constants/injection-keys'

provide(GrandAccountKey, { key: 'value' }) // [!code error] // 类型错误
provide(GrandAccountKey, { id: '1', name: 'grand' })
```

```ts [father.vue]
import { provide } from 'vue'
import { FatherAccountKey } from '@/constants/injection-keys'

provide(FatherAccountKey, { key: 'value' }) // [!code error] // 类型错误
provide(FatherAccountKey, { id: '2', name: 'father' })
```

```ts [son.vue]
import { inject } from 'vue'
import { GrandAccountKey } from '@/constants/injection-keys'

const account = inject(GrandAccountKey) // { id?: string, name?: string }
```

## 严格注入

Inject 默认注入名会被某个祖先组件提供，如果注入名确实没有任何组件提供，会在运行时抛出警告

Vue 官方推荐使用默认值来解决祖先组件未提供值的情况，但部分情况我们可能要求祖先组件必须提供注入

此时通常可以在子组件中判断 inject 值是否是 undefined 来抛出异常，但这种解决方案不够优雅

```ts
import { inject } from 'vue'
import { GrandAccountKey } from '@/constants/injection-keys'

const account = inject(GrandAccountKey)
if (!account) throw new Error('GrandAccountKey未被注入')
```

我们可以创建一个严格注入工具函数，在函数内部处理检查逻辑：

::: code-group

```ts [utils/index.ts]
export const injectStrict = <T>(key: InjectionKey<T>, defaultValue?: T | (() => T), treatDefaultAsFactory?: false): T => {
  const result = inject(key, defaultValue, treatDefaultAsFactory)
  if (!result) throw new Error(`${key.description}未被注入`)
  return result
}
```

```ts [comp.vue]
import { injectStrict } from '@/utils'
import { anyKey } from '@/constants/injection-keys'

const data = injectStrict(anyKey)
```

:::
