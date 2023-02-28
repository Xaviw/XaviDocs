# Axios源码解析

## 认识Axios

> 阅读源码前先熟悉库实际的使用方式以及各种API有助于找到阅读的切入点，[官方中文文档](https://axios-http.com/zh/docs/intro)

axios库基于核心类`Axios`，在库中默认导出了一个名为`axios`的实例对象，并传入了基础配置`defaults`

使用中所有的操作通常基于默认导出的实例对象`axios`实现。当然也可以自己导入`Axios`类，手动定义全部配置后新建实例使用

基础API有：

1. **instance.defaults**
   
   设置实例的基础参数，与初始化实例时的`defaultConfig`合并，作为该实例的参数

2. **instance.interceptors**
   
   配置实例拦截器

3. **instance.request(config)**
   
   发起请求的核心API，`instance()`，`instance.post()`，`instance.get()`等方法都是基于此核心方法包装而来

   传入的config会与实例参数再次合并，作为实际请求参数

4. **instance.create(config)**
   
   基于当前实例对象创建新的实例对象，`config`与当前实例参数合并作为新实例的参数

## 认识源码

### 下载

**深入理解建议对照源码以及官方文档阅读**

axios源码分支中有`0.x`，`1.x`(默认)，`2.x`，查看`tags`可以看到发版记录。截至发文最新版本为`v1.3.3`，也就是基于的`1.x`分支中的源码

```
git clone --depth 1 https://github.com/axios/axios.git
```

> --depth 1 也就是只下载最近一次commit的分支，忽略历史记录，能加快下载速度。因为github网络原因clone可能会失败，可以多次尝试或者在[github仓库](https://github.com/axios/axios)中下载zip压缩包

### 上手

项目使用中安装好axios后，第一步是需要导入：

```js
import axios from 'axios'
```

此时模块查找顺序为：
- 当前文件层级下的`node_modules`
- 当前文件层级下的同名文件夹，此处即为名为`axios`的文件夹
- 找到了`node_modules`或同名文件夹后查找内部是否有`packages.json`
- 有``packages.json``且`main`属性指向的路径存在，则从路径对应的文件中尝试导入
- 没有`packages.json`或`main`属性错误，则尝试查找`index`文件并从中导入
- 如果都没找到，则按同样的规则在上层目录中依次查找，直到路径错误

实际项目中通过`npm`等工具安装，则会在项目根目录node_modules中找到axios目录，并通过`packages.json` -> `main`属性找到库入口为`index.js`文件

![源码入口](/images/前端系列/axios-1.png)

源码阅读中同理，需要从入口`index.js`文件看起。可以看到`index`中导入了`axios`并解构出API后再次统一导出，我们便可以通过快捷键跳转方法内部（VSCode默认按住alt键后单击）阅读具体的实现。常用快捷键还包括`alt + 左右方向键`切换跳转记录

> 在目录`index`文件中统一收集方法并导出是一种实用技巧，例如工具目录utils将各类型工具子目录中的方法统一导出后，引入只需要写`import {xxx} from '@/utils'`。可以降低路径记忆负担，增加效率

## Axios类

axios的一切操作始于原始类`Axios`(lib/core/Axios.js)，其中的逻辑比较简单：

1. 将传入的配置存入实例对象的`defaults`属性中
2. 在实例对象`interceptors`属性中初始化基础的`request`、`response`拦截器管理对象
3. 定义核心的`request`方法
4. 定义生成请求地址的辅助方法`getUri`
5. 基于`request`方法生成`delete`、`get`、`head`、`options`、`post`、`put`、`patch`方法

最核心的部分是`request`的实现方式

## request实现

### 一、合并参数

axios支持两种调用方法（实例对象如何作为函数调用会在后续源码中提到）：

```js
axios({
  method: 'get',
  url: '/user/12345',
});

axios('/user/12345');
```

所以`request`方法第一步需要检查参数格式，并合并出后续通用的参数：

```js
request(configOrUrl, config) {
    // 第一项为字符串则作为url合并入第二项配置中
    // 使用短路运算符兜底参数异常的情况
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    // 合并请求配置与实例配置
    config = mergeConfig(this.defaults, config);
    // ...
}
```

### 二、校验参数

得到实际参数后，解构出了`transitional, paramsSerializer, headers`

`transitional`无法在官方文档提供的参数中找到，但通过搜索能在 `README.md` 546行中找到说明，这是一个兼容老版本的过渡选项，之后可能会被移除。其作用是定义JSON解析的规则，包括JSON解析错误是否忽略；是否强制通过JSON转换响应；是否修改请求超时抛出的错误。源码中通过`validator.assertOptions`方法检查了该参数属性是否正确

<hr />

`paramsSerializer`同样检查了内部属性是否正确，其作用是自定义序列化查询参数的方式，主要针对数组查询参数，例如官方文档例子中通过`Qs`库转换数组作为查询参数:

```js
/**
   get请求方式传参称为query（查询参数），对应axios中的params，传递数组时有几种不同的转换形式
   例如axios.get('xxx',{arr:[1,2]})时，不同的arrayFormat对应生成的参数为：
   indices -> xxx?arr[0]=1&arr[1]=2
   brackets -> xxx?arr[]=1&arr[]=2
   repeat -> xxx?arr=1&arr=2
 */
  paramsSerializer: function (params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
  },
```

细心点可以看出`Axios`类源码中校验`paramsSerializer`的格式为一个包含`encode`和`serialize`属性的对象，不同于官方文档中的一个函数。这里确实是官方文档与源码版本的不同步，可以在源码中的`README.md`中看到当前版本的正确文档。

`v1.3.3`中正确的`paramsSerializer`配置应该为：

```js
{
  paramsSerializer: {
    // 此处为源码中默认的encode，一般不用传递，直接使用默认的
    // encode仅在未配置serialize，且传递的params不是URLSearchParams类型的对象才会执行
    encode: function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    },
    // 接收params并处理，若手动处理需要注意params可能是URLSearchParams类型对象，在Qs库中已处理
    serialize: function (params, options) {
      return Qs.stringify(params, {arrayFormat: 'brackets'})
    }
  }
}
```

> 在`axios 2.x`中此属性已简化为`{indexes: xxx}`，默认`null`对应`arrayFormat`值的`repeat`，`false`对应`brackets`，`true`对应`indices`

### 三、计算headers

`headers`即自定义请求头，在lib/defaults/index.js中定义的默认headers为：

```js
const DEFAULT_CONTENT_TYPE = {
  'Content-Type': undefined
};

const defaults = {
   // ...
   headers: {
      common: {
         'Accept': 'application/json, text/plain, */*'
      }
  }
}

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});
```

可以看到`common`作为公共请求头，定义了`Accept`。之后又分别为单独的请求方式定义了各自独有的配置对象

> **merge是合并对象方法，在此处的作用相当于对象拷贝，避免直接赋值一个对象，互相影响**

回到`Axios`类源码中的`headers`，定义了`contextHeaders`等于`common`合并请求方式独有的配置，之后删除了`headers`中包括`common`在内的请求方式独有配置

**此时`contextHeaders`为默认配置中定义的属性，`headers`则为用户传入的属性**

之后通过`AxiosHeaders.concat`静态方法将`headers`对象标准化。lib/core/AxiosHeaders.js中的代码较多，但拆分理解每个函数的作用后就能较为容易的读懂整体流程。而且库中函数命名非常直观，**通过命名就能知道函数作用是非常重要的**

```js
// AxiosHeaders.js

// 规范化header名（去掉首尾空格的全小写字符串）
function normalizeHeader(header) {...}

// 规范化header值（false、null不变，其余类型转为字符串，数组中的值递归调用格式化）
function normalizeValue(value) {...}

/*
匹配 key = value（等号两边可以有任意空白字符，= value这部分可以不存在，value也就是undefined）格式的字符串，并将key、value存储到对象返回
Object.create(null)创建没有原型的空对象
https://regexr-cn.com/ 可以帮助理解、学习、测试正则表达式

需要注意这里的while。常规情况下，赋值表达式会返回右边的值，匹配成功时数组作为条件会造成死循环
但这里情况不一样，属于正则的特性之一（参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#%E6%8F%8F%E8%BF%B0）

循环会使用tokensRE的lastIndex属性作为条件
首次匹配成功返回值为匹配结束字符的下标+1，也就是字符串长度+1，条件成立
后续匹配因为下标超出文本长度，匹配失败lastIndex为0，条件不成立
*/
function parseTokens(str) {...}

// header名是否可用
function isValidHeaderName(str) {...}

// 判断header值是否匹配filter
function matchHeaderValue(context, value, header, filter) {...}

// 规范化header名（去掉首尾空格的首字母大写字符串）
// 注意replace使用函数替换的方法，参考https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace#%E6%8F%8F%E8%BF%B0
function formatHeader(header) {...}

// utils.toCamelCase(' ' + header)中的空格是因为toCamelCase内部以空格匹配单词分隔
// 通过Object.defineProperty向obj中添加请求头操作方法：getCamelCase，setCamelCase，hasCamelCase
// 在AxiosHeaders类中的静态方法accessor中被调用时，是将AxiosHeaders类原型作为obj传入
// 所以当访问上面三个属性时，相当于调用的AxiosHeaders.getCamelCase，this是AxiosHeaders
// 所以代码中的 this[methodName].call 实际也是执行了AxiosHeaders类中的get、set、has方法
function buildAccessors(obj, header) {...}

class AxiosHeaders {
  // 接收header存入实例中，支持对象，字符串
  // 通过!isValidHeaderName(header)判断字符串不是简单的命名字符串
  // 通过parseHeaders(lib/helpers/parseHeaders.js)解析字符串，以换行\n分隔数据，每一行以冒号:分隔键值对
  // set-cookie项存为数组，其余项键同名的以逗号拼接值存储
  set(header, valueOrRewrite, rewrite) {...}

  // 根据请求头名获取对应值的方法
  // 内部处理了header格式的规范化，传入parser处理返回值
  // parser=true返回对象格式，parser=函数调用函数返回，parse=正则，返回匹配后的值
  get(header, parser) {...}

  // 返回是否存在header的布尔值，如果有matcher会进行比对
  // matcher是函数调用函数，matcher是字符串匹配是否是值的一部分，matcher是正则调用是否匹配
  has(header, matcher) {...}

  // 删除请求头，返回布尔值
  // matcher对应has，匹配成功的删除
  // header是数组时，会循环调用匹配删除
  delete(header, matcher) {...}

  // 根据matcher清空，返回布尔值（有任意删除则为true，完全不匹配为false）
  clear(matcher) {...}

  // 规范化实例内的headers键值
  // format为布尔值，表示是否需要格式化header名（连续字符串首字母大写）
  // 内部的 if(key){...} 作用是处理仅名字格式不同的header，格式化后覆盖旧值，并删除多余属性
  normalize(format) {...}

  // 合并headers
  concat(...targets) {...}

  // 输出所有headers到一个对象中
  // asStrings为布尔值，表示数组是否需要转为字符串
  toJSON(asStrings) {...}

  // 重写内建iterator方法，遍历实例时会调用新定义的方法
  [Symbol.iterator]() {
    // entries转换对象后：[[k1,v1], [k2,v2], ...]作为数据源调用数组内置迭代器
    // 之后可以通过返回值.next()遍历数组，相关知识参考https://zh.javascript.info/iterable
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }

  // 返回\n分隔的字符串
  toString() {...}

  // 在实例中增加一个标识符属性，在utils.js isPlainObject方法中有用到
  // 所以作用为将AxiosHeaders的实例不识别为普通对象
  get [Symbol.toStringTag]() {...}

  // 静态方法，确保将传入的参数转为AxiosHeaders实例
  static from(thing) {...}

  // 静态方法，合并headers，并转为AxiosHeaders实例
  static concat(first, ...targets) {...}

  // 使用上面的buildAccessors方法向原型中添加请求头操作方法
  // 支持单个或数组
  static accessor(header) {...}

  // 源码中设置了这些请求头的操作方法
  AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

  // 冻结AxiosHeaders中的原型方法与静态方法
  // 修改函数自身属性的enumerable=false, writable = false, 添加set方法触发时报错
  // 对象的自身属性可以查看https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
  utils.freezeMethods(AxiosHeaders.prototype);
  utils.freezeMethods(AxiosHeaders);
}
```

### 四、处理拦截器

前面提到了`Axios`类初始化时创建了基础的拦截器管理对象`new InterceptorManager()`，内部实现了简单的事件注册、注销机制，查看源码lib/core/interceptorManager.js：

```js
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }

  // 通过use注册拦截器，也就是将拦截器加入handlers数组
  // use方法还支持官方文档中未提到的第三个参数，配置拦截器是异步还是同步执行以及执行时机
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }

  // use的返回值就是拦截器的下标
  // 通过设置为null取消拦截器
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }

  // 封装遍历方法，跳过被删除的拦截器
  forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
```

回到`request`流程中：

```js
// ...

// 创建请求拦截队列
const requestInterceptorChain = [];
// 同步标记默认true
let synchronousRequestInterceptors = true;
// 调用内部遍历方法，跳过已取消的拦截器
this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
  // 有runWhen则执行，根据返回值判断该拦截器是否需要执行
  if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
    return;
  }
  // 只要有一个拦截器是异步的(默认异步)，则同步标记设为false
  synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
  // 向请求拦截队列队首添加拦截器，也就是说请求拦截器是按添加顺序反向执行的，后添加的先执行
  requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
});

// 创建响应拦截队列
const responseInterceptorChain = [];
this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
  // 向响应拦截队列队首添加拦截器，响应拦截器按添加顺序执行
  responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
});

let promise;
let i = 0;
let len;

// 如果存在异步拦截器（默认情况）
if (!synchronousRequestInterceptors) {
  // 创建 调度请求 方法，后补undefined是为了长度为2，与拦截器[request,reject]对齐
  const chain = [dispatchRequest.bind(this), undefined];
  // 将请求拦截器添加至队首
  chain.unshift.apply(chain, requestInterceptorChain);
  // 将响应拦截器添加至队尾
  chain.push.apply(chain, responseInterceptorChain);
  len = chain.length;
  // 将config作为promise链的参数，这也是为什么请求拦截器中每一次都需要return config
  promise = Promise.resolve(config);
  // 遍历执行整个队列，通过promise链式调用（按顺序执行，不是异步字面意思的异步执行）
  // 执行顺序：请求拦截器 -> 请求 -> 响应拦截器
  // 链式调用中的错误能通过后面注册的reject方法修正，也就是不会出错后立马终止请求，
  while (i < len) {
    promise = promise.then(chain[i++], chain[i++]);
  }
  // 返回请求结果promise
  return promise;
}
// 后续代码为不存在异步拦截器的情况，相当于省略了else（每一个请求拦截器都设置了synchronous:true）
len = requestInterceptorChain.length;
let newConfig = config;
i = 0;
// 遍历执行请求拦截器，并更新config
while (i < len) {
  const onFulfilled = requestInterceptorChain[i++];
  const onRejected = requestInterceptorChain[i++];
  try {
    newConfig = onFulfilled(newConfig);
  } catch (error) {
    onRejected.call(this, error);
    // 同步请求拦截器中的错误，会直接终止请求
    break;
  }
}
// 请求拦截器执行完成后执行调度请求
try {
  promise = dispatchRequest.call(this, newConfig);
} catch (error) {
  return Promise.reject(error);
}
// 遍历执行响应拦截器
i = 0;
len = responseInterceptorChain.length;
while (i < len) {
  promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
}
// 返回最终结果promise
return promise;
```

> axios的链式调用模式可以作为常规的前置处理、后置处理方式

上面的代码中需要着重注意下同步拦截器和异步拦截器的差异（需要理解Promise的执行逻辑）：

- 异步拦截器中每一个环节的错误都可以由下一个拦截器的reject方法处理
   
   处理后返回的值会作为后续resolve方法的参数，所以极端情况下最后一个执行的请求拦截器出错后，因为请求方法的reject是undefined，所以会直接传递给第一个执行的响应拦截器的reject方法，这回导致实际请求被跳过，得到的结果是响应拦截器reject方法返回的（所以实际项目中往往都是层层传递错误，避免错误发生后仍resolve）

- 同步拦截器中的请求拦截环节只要出错就会终止请求，后续的实际请求和响应拦截环节是通过Promise链

### 五、发起请求

#### 1. dispatchRequest

请求链中的`dispatchRequest`（lib/core/dispatchRequest.js）是实际发起请求的方法

```js
export default function dispatchRequest(config) {
  // 如果请求已取消，抛出错误
  throwIfCancellationRequested(config);
  // 得到请求头，from方法确保请求头被AxiosHeaders处理过
  config.headers = AxiosHeaders.from(config.headers);

  // 传入配置中的transformRequest转换请求参数
  // transformData内部实现并不复杂，可以自行查看
  config.data = transformData.call(
    config,
    config.transformRequest
  );

  if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
    // setContentType源自介绍Headers中提到的buildAccessors方法
    // 所以这里相当于执行了AxiosHeaders.set('ContentType', 'application/x-www-form-urlencoded', false)
    config.headers.setContentType('application/x-www-form-urlencoded', false);
  }
  // 获取请求适配器，在下文中解读
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter);
  // 使用适配器执行请求
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // 调用config中的transformResponse处理响应
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );

    response.headers = AxiosHeaders.from(response.headers);

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders.from(reason.response.headers);
      }
    }

    return Promise.reject(reason);
  });
}
```

#### 2.adapters

lib/adapters/adapters.js中定义了适配器的获取过程

```js
// 定义内置适配器对象
const knownAdapters = {...}
// 向内置适配器对象中添加name、adaptername属性，值为适配器名称
utils.forEach(knownAdapters, (fn, value) => {...})

export default {
  getAdapter: (adapters) => {
    // 规范化参数为数组
    adapters = utils.isArray(adapters) ? adapters : [adapters];
    // 结构除数组长度
    const {length} = adapters;
    let nameOrAdapter;
    let adapter;

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      // 当前适配器参数是字符串则从内部适配器对象中获取，否则直接使用适配器参数
      // 赋值表达式返回值为所赋的值，所以适配器获取成功会终止循环
      // 从内部适配器获取失败，或适配器参数异常时则会继续尝试数组中的下一项
      if((adapter = utils.isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter)) {
        break;
      }
    }
    // 循环结束后适配器仍未获取到，抛出错误
    if (!adapter) {...}
    // 获取到的适配器不是函数，抛出错误
    if (!utils.isFunction(adapter)) {...}

    return adapter;
  },
  adapters: knownAdapters
}
```

#### 3.xhrAdapter

`httpAdapter`是`node`环境中使用的请求方法，本文不做解读，内部封装与`xhr`类似。阅读之前需要先熟悉`XMLHttpRequest`，推荐阅读[现代JavaScript教程](https://zh.javascript.info/xmlhttprequest)中的文章

代码中有用到`platform.isStandardBrowserEnv`，跳转源码可会发现`platform`只导出了`node`目录，又是怎么调用`browser`目录下api的呢。这里需要了解`packages.json`中的`browser`字段

前文介绍了`main`字段定义了整个包的入口文件，除此之外还有两个跟入口有关的字段：

- `module`字段定义包ESM规范入口文件，browser环境与node环境均可使用

- `browser`字段定义browser环境下的import路径对应的实际文件

因为axios在浏览器与服务端均可使用，所以`platform`默认导出node文件，再通过browser属性在浏览器环境下将导入修改为browser文件

```js
// 判断xhr是否可用
const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';
// 使用&&短路运算，当xhr不可用时前文的xhrAdapter=false，adapters的匹配循环中会匹配失败，进而匹配下一项
export default isXHRAdapterSupported && function (config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    let requestData = config.data;
    const requestHeaders = AxiosHeaders.from(config.headers).normalize();
    const responseType = config.responseType;
    let onCanceled;
    // 设置done方法，在请求结束后停止取消请求功能
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }
    // 请求参数是FormData格式且为浏览器环境时，取消ContentType设置（浏览器会自动识别参数添加ContentType为JSON或FormData）
    if (utils.isFormData(requestData) && (platform.isStandardBrowserEnv || platform.isStandardBrowserWebWorkerEnv)) {
      requestHeaders.setContentType(false);
    }

    let request = new XMLHttpRequest();

    // 后端鉴权参数，可以测试时使用（需要服务端鉴权规则符合下面代码的标准）
    if (config.auth) {
      const username = config.auth.username || '';
      // unescape为JS自带解码API，现已废弃，推荐使用decodeURI或decodeURIComponent替代
      // 将URI中的特殊字符转码\解码
      const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      // btoa是浏览器自带转base64 api，atob则能解码base64
      requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
    }
    // 构建完整请求地址
    const fullPath = buildFullPath(config.baseURL, config.url);
    // 建立XHR请求，buildURL构建包括查询参数的完整链接
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
    // 设置超时时间，axios中默认为0，永不超时
    request.timeout = config.timeout;

    // 下面的代码调整了书写顺序，方便理解

    // Remove Content-Type if data is undefined
    requestData === undefined && requestHeaders.setContentType(null);

    // 将config中的请求头添加到xhr对象
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }

    // 根据配置添加withCredentials
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // 设置responseType
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // 处理响应进度
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
    }

    // 处理上传进度（判断兼容性）
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
    }

    // axios支持cancelToken(基于xhr.abort)，与signal(基于AbortController API)两种取消请求方式
    // cancelToken现已弃用，不推荐使用，查看文档https://axios-http.com/zh/docs/cancellation
    if (config.cancelToken || config.signal) {
      // 两种方式通用的请求处理方法
      onCanceled = cancel => {
      // 请求不存在，证明请求已被处理过（处理事件结尾会设置request = null，包括出错、超时、已取消或onloadend已执行）
        if (!request) { return; }
        reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      // cancelToken基于发布订阅模式，后文会简答介绍
      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        // 判断取消是否已执行，执行取消或开始监听取消
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }
    // 正则获取请求协议，推荐使用上文介绍的正则分析工具理解内部实现
    const protocol = parseProtocol(fullPath);
    // 如果当前环境不支持此协议，返回错误
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
      return;
    }
    // 发送请求
    request.send(requestData || null);

    if ('onloadend' in request) {
      // 如果onloadend可用，注册回调
      request.onloadend = onloadend;
    } else {
      // onloadend不可用，监听状态
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // 此处处理readyState等于4，但status仍是0的情况
        // 部分浏览器可能会因为使用了file协议而出现这种情况，即使请求是成功的
        // 下面判断的是非file协议导致这种情况则return，因为file协议导致的情况下请求是成功的，可以继续执行
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate处理在onerror与ontimeout之前
        // 所以推迟一轮事件循环，让onerror、ontimeout能被触发，之后再决定如何处理响应
        setTimeout(onloadend);
      };
    }
    // 无论请求是否成功均会触发XHR loadend事件
    function onloadend() {
      // 请求不存在，证明请求已被处理过（处理事件结尾会设置request = null，包括出错、超时、已取消或onloadend已执行）
      if (!request) { return; }
      // getAllResponseHeaders是xhr自带api，返回所有响应头
      const responseHeaders = AxiosHeaders.from(
        'getAllResponseHeaders' in request && request.getAllResponseHeaders()
      );
      // 请求config中未设置responseType或者设置为text、json取responseText
      // 其他情况取response，根据responseType可能返回ArrayBuffer、Blob、Document、Object或字符串
      const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
        request.responseText : request.response;
      // 整理需要返回的数据
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      // settle内部判断了validateStatus参数，来决定请求是resolve还是reject
      // settle中的!response.status条件，对应上文中的file协议成功但status仍未0的情况（因为其余异常情况均已处理，会终止请求）
      // 处理完成后执行done，删除“取消”监听
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      // 处理完成后删除request
      request = null;
    }

    // 此处省略取消请求处理、网络错误处理、超时处理、xsrf设置...
  });
}
```

### 六、取消请求

推荐使用的`AbortController`是较新的浏览器原生API，可以在[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController)中详细了解，使用方法官网中也给出了详细例子，这里不再讲解

已弃用的`CancelToken`不再推荐使用，但其内部lib/cancel/CancelToken.js的实现方式仍值得学习。该API使用方式为：

```js
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('xxx', { cancelToken: source.token })

source.cancel('取消原因');
```

核心逻辑中的调用方式为：

```js
// 订阅取消监听
config.cancelToken.subscribe(onCanceled)
// 退订取消监听
config.cancelToken.unsubscribe(onCanceled);
```

下面来看看源码中是如何实现的：

```js
class CancelToken {
  // cancelToken生成工厂方法
  // 返回的cancel是取消方法，token则是当前CancelToken实例对象
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }

  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }
    // 创建用于触发取消的方法
    // Promise符合取消请求这种状态仅能改变依次的需求
    // 同时能看出取消请求是异步执行的
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    // source.cancel执行后触发
    this.promise.then(cancel => {
      // cancel参数也就是取消原因
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        // 遍历监听中事件并依次执行取消，注意是倒序执行
        token._listeners[i](cancel);
      }
      // 执行完毕后清空事件
      token._listeners = null;
    });
    // 这段赋值代码不会影响上面已经绑定的then事件
    // 作用是可以通过source.token.promise.then(xxx)注册事件，可以注册多个,注册的返回值是一个promise，且带有cancel属性用于取消注册
    // 注册的方法会在source.cancel()调用后执行，且先于请求的catch
    // 没有想到这个功能有什么作用，因为同样的功能在catch中也能实现，且更为直观。也没有查询到任何相关的说明，因为官方已经不推荐使用CancelToken，故不再纠结这里的用意了
    this.promise.then = onfulfilled => {
      let _resolve;
      // 仅cancel触发时才会让onfulfilled执行
      const promise = new Promise(resolve => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      // 提供了取消绑定事件的方法
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    // source方法中将executor参数赋给了cancel，所以取消请求实际调用的就是这里的cancel函数
    executor(function cancel(message, config, request) {
      // 取消已被调用过，忽略
      if (token.reason) { return; }
      token.reason = new CanceledError(message, config, request);
      // 执行取消
      resolvePromise(token.reason);
    });
  }
  // 订阅取消请求事件
  subscribe(listener) {
    // this.reason也就是cancel函数中的token.reason
    // reason存在，代表取消已执行过，立即执行新注册的取消处理器
    if (this.reason) {
      listener(this.reason);
      return;
    }
    // 因为同一个token能用于取消多个请求，所以需要使用数组
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  // 退订取消请求事件，在数组中找到并删除
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
}
```

## 扩展请求方法

在`Axios`类`request`方法中已经实现了完整的请求逻辑，扩展其他的请求方法就只需要通过`request`包装一层便能实现：

```js
// lib/core/Axios.js
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
// 可能提交表单的请求方式，扩展了`methodForm`的别名方法，会自动修改请求头
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url,
        data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});
```

前面提到了`Axios`实例对象还能当作函数调用，相关代码定义在 lib/axios.js 中

```js
function createInstance(defaultConfig) {
  // 新建实例
  const context = new Axios(defaultConfig);
  // 创建instance等于一个绑定this为当前实例的request函数，所以实例能直接当函数调用
  const instance = bind(Axios.prototype.request, context);
  // 拷贝原型属性到instance，包括request和各种扩展请求方法以及getUri方法
  utils.extend(instance, Axios.prototype, context, {allOwnKeys: true});
  // 拷贝实例属性到instance，也就是defaults和interceptors
  utils.extend(instance, context, null, {allOwnKeys: true});
  // 在instance上创建create方法
  instance.create = function create(instanceConfig) {
    // create创建的新实例会继承原实例的配置
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}

/* ---------- bind内部实现 ------------ */
export default function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
/* ---------- extend内部实现 ------------ */
// a是目标对象
// b是源对象
// c是提供给对象函数绑定的this参数
// allOwnKeys表示是否遍历原型链中的属性
const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
  // forEach是自定义的遍历方法，支持数组或对象
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, {allOwnKeys});
  return a;
}
```

## 工具函数

axios源码中以函数式编程为主，创建了大量的工具函数。函数式编程有逻辑清晰、利于复用、利于Tree Shaking优化等优点。阅读、掌握这些工具函数能扩宽我们的编程思路，提高编程效率

工具函数主要创建在 lib/utils.js 中，这里仅讲解一个较为实用的例子：

```js
const {toString} = Object.prototype;
const kindOf = (cache => thing => {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));

/*-------------kindOf是一个立即执行函数，上面的代码等同于于：------------------*/
// 创建没有原型的空对象用以缓存
const cache = Object.create(null)
const kindOf = thing => {
  // 更准确的获取类型方法，返回 [object TypeName]
  const str = Object.prototype.toString.call(thing)
  // 有缓存直接返回
  if(cache[str]) {
    return cache[str]
  } else {
    // 缓存TypeName部分的小写字符串，并返回
    // cache的意义就是省略了重复的slice().toLowerCase()操作
    cache[str] = str.slice(8, -1).toLowerCase()
    return cache[str]
  }
}
/*--------------------------------------------------------------------------*/
// 接收任意type字符串后，返回一个校验的函数
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type
}
// 在paramsSerializer逻辑中用到了这个方法，作用是判断传入的参数是不是原生URLSearchParams对象
const isURLSearchParams = kindOfTest('URLSearchParams');
```


## 总结

阅读Axios源码，除了能理解这个经典请求库的执行逻辑之外，相信还可以增加对编程的一些思考：

- 灵活使用短路运算符、三目运算符、立即执行函数等语法适当简化代码
- 参数需要严格判断类型，处理边界情况，并设置兜底的值，避免意外错误
- 变量名需要见名知意，axios中甚至作为参数的函数都使用了具名函数
- 运用函数式编程范式以及设计模式优化代码与逻辑（需要针对系统性学习）
- 官方文档仍有更新不及时甚至出错的情况（特别是非官方的翻译文档），遇到问题可以尝试从源码中找答案
- ......
