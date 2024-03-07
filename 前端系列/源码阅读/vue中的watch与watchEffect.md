# `vue` 中的 `watch` 和 `watchEffect`

vue 提供了 `watch` 方法，可以监听值的变更，在变更时触发回调。vue3 中又新增了 `watchEffect` 方法，可以不指定监听的值，而是在回调中直接使用，方法会自动收集使用到的依赖，并在依赖更改时重新执行。

watch 和 watchEffect 源码都定义在 `runtime-core/src/apiWatch.ts` 中。

## 前置知识

学习 watch 前需要先了解 Vue 的响应式数据原理。如果还不了解，推荐学习后再看本文。

简单来说创建响应式数据后，Vue 会监听数据的读取和修改。在读取时收集（`track`）值的依赖（依赖就是使用到值的函数，称为副作用函数。函数执行后会对视图等产生影响，这个影响就称为副作用。），在修改时取出依赖并依次触发执行（`trigger`），从而实现视图更新。

## 使用方式

我们可以从类型定义中先学习下两个方法的用法：

```ts
export type WatchEffect = (onCleanup: OnCleanup) => void;

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);

export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: OnCleanup
) => any;

type MapSources<T, Immediate> = {
  [K in keyof T]: T[K] extends WatchSource<infer V>
    ? Immediate extends true
      ? V | undefined
      : V
    : T[K] extends object
    ? Immediate extends true
      ? T[K] | undefined
      : T[K]
    : never;
};

type OnCleanup = (cleanupFn: () => void) => void;

export interface WatchOptionsBase extends DebuggerOptions {
  flush?: "pre" | "post" | "sync";
}

export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
  immediate?: Immediate;
  deep?: boolean;
  once?: boolean;
}

export type WatchStopHandle = () => void;

export function watchEffect(
  effect: WatchEffect,
  options?: WatchOptionsBase
): WatchStopHandle {
  // ...
}

export function watch<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>
): WatchStopHandle;

export function watch<
  T extends MultiWatchSources,
  Immediate extends Readonly<boolean> = false
>(
  sources: [...T],
  cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>
): WatchStopHandle;

export function watch<
  T extends Readonly<MultiWatchSources>,
  Immediate extends Readonly<boolean> = false
>(
  source: T,
  cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>
): WatchStopHandle;

export function watch<
  T extends object,
  Immediate extends Readonly<boolean> = false
>(
  source: T,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>
): WatchStopHandle;

export function watch<T = any, Immediate extends Readonly<boolean> = false>(
  source: T | WatchSource<T>,
  cb: any,
  options?: WatchOptions<Immediate>
): WatchStopHandle {
  // ...
}
```

### watchEffect

可以看到 watchEffect 接收一个要运行的副作用函数（`WatchEffect`）和配置选项（`WatchOptionsBase`）。

副作用函数的参数（`OnCleanup`）也是一个函数，可以在副作用中调用，调用时传入清理无效副作用的函数（`cleanupFn`）。例如一个异步请求，在上次请求还未完成时副作用就又被触发，此时就应该调用 `onCleanUp`，传入取消上次请求的方法，避免过期的副作用影响使用。

配置选项参数用来调整副作用的刷新时机（或者调试副作用的依赖，这里不做讲解），默认情况下值为 `flush: 'pre'`，代表侦听器在组件渲染之前执行。设置 `post` 后会延迟到组件渲染之后再执行，设置 `sync` 可以在依赖发生改变时立即触发侦听器。

watchEffect 的返回值是一个停止副作用函数的方法 `WatchStopHandle`。

### watch

watch 方法有多个函数重载，包含了多种侦听来源（`WatchSource`）的情况。第一个参数侦听来源可以是以下几种：

1. 返回值的函数（称为 `getter` 函数）
2. `ref`
3. `reactive`
4. 由以上值组成的数组

第二个参数是侦听来源发生变化时要调用的回调函数（`WatchCallback`），回调默认是懒侦听的（仅在侦听源发生变化时才执行）。回调函数参数分别为新值（`value`）、旧值（`oldValue`）、以及一个清理副作用的函数（`OnCleanup`）。当侦听的是多个值时，回调中的新值、旧值参数也会变为数组。

watch 第三个参数是一个可选的配置对象，支持以下选项：

- `immediate`：在侦听器创建时立即触发回调。第一次调用时旧值是 undefined。
- `deep`：如果源是对象，强制深度遍历，以便在深层级变更时触发回调。参考深层侦听器。
- `flush`：调整回调函数的刷新时机。参考回调的刷新时机及 watchEffect()。
- `onTrack / onTrigger`：调试侦听器的依赖。参考调试侦听器。
- `once`: 回调函数只会运行一次。侦听器将在回调函数首次运行后自动停止。

## 实现方式

源码中 watch 和 watchEffect 实际上是调用的同一个函数 `doWatch`，调用方式分别为：

- watchEffect：`return doWatch(effect, null, options)`
- watch：`return doWatch(source as any, cb, options)`

可以看到 watch 和 watchEffect 配置选项相同，不同只是 watchEffect 将副作用函数作为了数据源传入且没有回调函数。

`doWatch` 源码逻辑大致可以分为以下几步：

1. 创建 `getter`
2. 创建 `onCleanup`
3. 创建 `job`、`scheduler`
4. 执行副作用函数
5. 返回 `unwatch`

下面依次进行解析。

### 创建 `getter`

从 Vue 的响应式原理可以知道，要监听值的变化其实就是将需要执行的副作用函数加入值的依赖列表中。所以可以创建一个 getter 函数，作用就是读取数据源触发依赖收集。

源码中分别对以下几种情况做了处理：

> 前三种情况都是对 watch 的处理，因为 watchEffect 的数据源是一个函数。

1. 如果数据源是 Ref 值，返回 `source.value`。
2. 如果数据源是 Reactive 值，调用 `reactiveGetter` 方法对数据源可能使用到的属性触发访问后返回数据源本身。

`reactiveGetter` 方法内部调用了 `traverse` 方法。如果开启了 `deep` 配置，会递归的对数据源深层次属性进行访问；如果没开启 `deep` 配置，则只会对数据源第一层属性进行访问。

3. 如果数据源是数组，会遍历数组，将处理后的数组值返回。对于 `Ref` 和 `Reactive` 值与上面的处理一样，对于函数直接获取返回值。
4. 如果数据源是函数，需要根据是否存在回调函数参数（`cb`）分别处理 watch 和 watchEffect 的情况：

- 对于 watch，直接执行函数并返回函数返回值。
- 对于 watchEffect，这里加入了执行的逻辑。先判断是否有 `cleanup` 并执行，再执行 watchEffect 参数中的副作用函数（会将 `onCleanup` 作为参数传入）

源码中还创建了 `forceTrigger`、`isMultiSource` 变量，分别标识是否需要强制触发更新和是否是多数据源，后面会介绍相关作用。

完整源码还包括参数检查和 Vue2 兼容代码，此处不做介绍。主要源码如下：

```ts
// 对 deep=false 的情况进行处理，traverse 方法会触发对 source 第一层属性的访问，然后返回 source
const reactiveGetter = (source: object) =>
  deep === true ? source : traverse(source, deep === false ? 1 : undefined);

let getter: () => any;
let forceTrigger = false;
let isMultiSource = false;

if (isRef(source)) {
  // Ref 值返回 .value
  getter = () => source.value;
  // 是浅层响应值时标记为需要强制更新
  forceTrigger = isShallow(source);
} else if (isReactive(source)) {
  // Reactive 值直接返回数据源
  getter = () => reactiveGetter(source);
  // 标记需要强制更新
  forceTrigger = true;
} else if (isArray(source)) {
  // 标记多数据源
  isMultiSource = true;
  // 存在 Reactive 值或 ShallowRef 值时标记需要强制更新
  forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
  // 对数组值进行处理后返回
  getter = () =>
    source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction(s)) {
        // 函数直接执行，获取返回值
        return callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER);
      }
    });
} else if (isFunction(source)) {
  if (cb) {
    // cb 存在，说明是 watch
    // 直接执行函数并返回
    getter = () =>
      callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER);
  } else {
    // cb 不存在，说明是 watchEffect
    // getter 会直接作为数据源的依赖，所以内部需要处理逻辑
    getter = () => {
      // 如果存在 cleanup,执行清理
      if (cleanup) {
        cleanup();
      }
      // 执行传入 watchEffect 的副作用函数
      return callWithAsyncErrorHandling(
        source,
        instance,
        ErrorCodes.WATCH_CALLBACK,
        [onCleanup] // 将 onCleanup作为参数，用户便可以通过 onCleanup 传入清理副作用的方法
      );
    };
  }
}

// watch 开启 deep 的情况在这里处理,因为需要判断 cb 是否存在,避免参数错误的情况
if (cb && deep) {
  const baseGetter = getter;
  // traverse 会递归访问每一个属性后返回数据源本身
  getter = () => traverse(baseGetter());
}
```

### 创建 `onCleanup`

源码中定义了 `cleanup` 变量和 `onCleanup` 函数。

`onCleanup` 接收一个函数参数作为清除过期副作用的方法，内部会将接收到的方法赋值给 `cleanup` 变量和后面创建的响应式对象的 `onStop` 方法。这样在手动调用 `cleanup` 或当前副作用被从数据源的依赖中剔除时（即 `effect.stop` 被触发时）便可以执行过期副作用清除。

正如前面定义 watchEffect 的 `getter` `定义，onCleanup` 会作为参数被传入回调中，所以用户能够正确传入清除方法。

主要源码为：

```ts
let cleanup: (() => void) | undefined;

let onCleanup: OnCleanup = (fn: () => void) => {
  // effect 是 watch 处理后的主体逻辑
  // 执行 cleanup 或者 watch 被从依赖中清除时都执行清除过期依赖
  cleanup = effect.onStop = () => {
    callWithErrorHandling(fn, instance, ErrorCodes.WATCH_CLEANUP);
    // 清除过期依赖后重置
    cleanup = effect.onStop = undefined;
  };
};
```

### 创建 `job`、`scheduler`

在此之前，源码还进行了初始化值的操作，代码很简单：

```ts
let oldValue: any = isMultiSource
  ? new Array((source as []).length).fill(INITIAL_WATCHER_VALUE)
  : INITIAL_WATCHER_VALUE;
```

`job` 任务用于执行监听的整体逻辑。而 `scheduler` 调度器对应了 `flush` 配置项，用于调度任务在合适的时机执行，主要源码为：

```ts
let scheduler: EffectScheduler;

if (flush === "sync") {
  // sync 时，立即触发 job
  scheduler = job as any;
} else if (flush === "post") {
  // post时，通过 queuePostRenderEffect 方法延迟触发 job
  scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
} else {
  // 默认的 pre，通过 queueJob 方法在组件渲染前触发 job
  scheduler = () => queueJob(job);
}
```

有了 `job` 和 `scheduler`，源码中通过 `ReactiveEffect` 类创建了 `effect` `对象。ReactiveEffect` 是响应式核心类，内部的 `run` 方法会触发传入的函数执行（这里为 `getter`），并执行依赖收集；而 `stop` 方法会将副作用从相关数据源的依赖中删除。

```ts
const effect = new ReactiveEffect(getter, NOOP, scheduler);
```

当 `job` 执行时，如果是 watch，会先调用 `effect.run`（也就是 `getter`）执行依赖收集以及获取当前监听的值。

然后进行是否触发变更的判断：

- 如果 `deep === true`：那么数据源深层次的属性也会被监听，而 `job` 被触发必然是属性发生了变更（除了后续第一次手动触发）
- 如果 `forceTrigger === true`：前面提到了数据源是 `shallowRef` 或 `Reactive` 时会标记 `forceTrigger`，因为使用 `shallowRef` 作为数据源时只有可能 `.value` 被替换才会触发副作用；而 `Reactive` 作为数据源时相当于设置了 `deep` 选项，对象深层次的变更也会触发副作用
- 上面两个判断不通过再比较新、旧值是否相等，如果是数组则遍历比较。比较使用的 `Object.is` 方法

判断到值变更后，先判断 `cleanup` 是否存在并执行，再调用回调函数。调用回调函数时会将新值、旧值、`onCleanup` 一并作为参数传入。

最后用本次获取的值更新 `oldValue`。

如果是 watchEffect 则直接执行 `effect.run`（也就是 `getter`）方法，上面已经说过内部实现，这里不再重复。

另外 `job` 还标记了是否允许递归，也就是自身触发数据源变更时是否再次执行副作用函数。

主要源码为：

```ts
const job: SchedulerJob = () => {
  if (!effect.active || !effect.dirty) {
    return;
  }
  if (cb) {
    // cb 存在，说明是 watch
    const newValue = effect.run();
    if (
      deep || // deep 监听时，无需再判断新、旧值是否变化
      forceTrigger || // shallowRef 或 Reactive 时，无需再判断新、旧值是否变化
      (isMultiSource
        ? (newValue as any[]).some((v, i) => hasChanged(v, oldValue[i])) // 数组遍历判断
        : hasChanged(newValue, oldValue)) || // hasChanged 内部实现为 !Object.is(newValue, oldValue)
    ) {
      // 清理过期副作用
      if (cleanup) {
        cleanup();
      }

      // 调用回调并传入参数
      callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
        newValue,
        oldValue === INITIAL_WATCHER_VALUE
          ? undefined
          : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE
          ? []
          : oldValue,
        onCleanup,
      ]);
      oldValue = newValue;
    }
  } else {
    // cb 不存在，说明是 watchEffect
    effect.run();
  }
};

// 根据是否是 watch 标记允许递归
job.allowRecurse = !!cb;
```

### 执行副作用函数

主体逻辑创建完成后，开始初始化的执行：

如果是 watch，开启了 `immediate` 是直接运行 `job`，否则仅调用 `effect.run` 触发依赖收集和记录初始 `oldValue` 值

如果是 watchEffect，直接调用 `effect.run` 触发依赖收集

主要源码为：

```ts
if (cb) {
  // watch
  if (immediate) {
    job();
  } else {
    oldValue = effect.run();
  }
} else {
  // watchEffect
  effect.run();
}
```

### 返回 `unwatch`

watch 与 watchEffect 方法还需要返回一个取消监听的方法，取消监听直接调用 `effect.stop` 即可从数据源的依赖中删除当前副作用：

```ts
const unwatch = () => {
  effect.stop();
};

return unwatch;
```

## 总结

`watch` 接收三个参数，分别是数据源、回调函数、配置选项；`watchEffect` 接收两个参数，分别是副作用函数、配置选项。

`watch` 与 `watchEffect` 在底层都是调用了 `doWatch` 函数。

`doWatch` 会创建访问依赖的函数 `getter`，对不同数据源的处理方式分别为：

- `Ref` 返回 `.value` 值
- `Reactive` 直接返回数据源，但是在开启 `deep` 时会递归访问每一个深层次属性，未开启 deep 时仅访问第一层属性
- 函数执行后返回返回值
- 数组遍历后对每一个成员按照上面三种方式处理，返回处理后的数组

再根据 `getter` 创建任务函数 `job`，内部分别处理 `watch` 和 `watchEffect` 的执行逻辑：

- `watch` 先执行 `effect.run` 获取数据源值，根据 `deep`、`forceTrigger`、`hasChanged` 三个条件判断值是否发生表更。若变更先判断并执行 `cleanup`，再将新值、旧值、`onCleanup` 作为参数传入回调并执行
- `watchEffect` 直接调用` effect.run` 方法（也就是封装的 `getter` 方法），内部会先判断并执行 `cleanup`，再将 `onCleanup` 函数作为参数传入副作用函数并执行

根据配置选项 `flush` 会创建不同的调度器 `scheduler`，如果为 `sync` 直接立即执行 `job`，如果为 `post` 或默认的 `pre` 会调用相应的调度方法再合适的时机执行

有了 `getter` 和 `scheduler` 之后，使用响应式核心类 `ReactiveEffect` 创建 `effect` `对象。doWatch` 内会进行初始化运行：

- `watch` 如果开启了 `immediate` 则执行 `job`（内部会执行 `effect.run`），未开启则执行 `effect.run`。`effect.run` 执行时会将 `effect` 副作用添加到每个数据源的依赖中，这样数据源变更时便可以触发副作用执行，也就完成了 `watch` 回调执行。
- `watchEffect` 直接执行 `effect.run` 方法，这回使副作用函数中每个响应式值都添加 `effect` 副作用，这样响应式值变更时就会触发副作用函数的重新运行。
