# Axios源码解析

## 认识Axios

> 阅读源码前先熟悉库实际的使用方式以及各种API有助于找到阅读的切入点，[官方中文文档](https://axios-http.com/zh/docs/intro)

axios库基于核心类`Axios`，在库中默认导出了一个名为`axios`的实例对象，并传入了基础配置`defaults`

使用中所有的操作通常基于默认导出的实例对象`axios`实现。当然也可以自己导入Axios类，手动定义全部配置后新建实例使用

基础API有：

1. instance.defaults
   
   设置实例的基础参数，与初始化实例时的defaultConfig合并，作为该实例的参数

2. instance.interceptors
   
   配置实例拦截器

3. instance(config)
   
   发起请求的核心API，`.request`，`.get`等方法都是基于此核心方法

   传入的config会与实例参数再次合并，作为实际请求参数

4. instance.create(config)
   
   基于当前实例对象创建新的实例对象，config与当前实例参数合并作为新实例的参数

## 认识源码

### 下载

**深入理解建议对照源码阅读**

```
git clone --depth 1 https://github.com/axios/axios.git
```

> --depth 1 也就是只下载最近一次commit的分支，忽略历史记录，能加快下载速度。因为github网络原因clone可能会失败，可以多次尝试或者在[github仓库](https://github.com/axios/axios)中下载zip压缩包

### 上手

安装好axios后，使用的第一步是需要导入：

```js
import axios from 'axios'
```

此时模块查找顺序为：
- 当前文件层级下的node_modules
- 当前文件层级下的同名文件夹，此处即为名为axios的文件夹
- 找到了node_modules或同名文件夹后查找内部是否有package.json
- 有package.json且main属性指向的路径存在，则从路径对应的文件中尝试导入
- 没有package.json或main属性错误，则尝试查找index文件并从中导入
- 如果都没找到，则按同样的规则在上层目录中依次查找，直到路径错误

实际项目中通过npm等工具安装，则会在项目根目录node_modules中找到axios目录，并通过packages.json -> main属性找到库入口为index.js文件

![源码入口](/images/frontEnd/sourceCode/axios/1.png)

源码阅读中同理，需要从入口index.js文件看起。可以看到index中导入了axios并解构出API后再次统一导出，我们便可以通过快捷键跳转方法内部（VSCode默认按住alt键后单击）阅读具体的实现。常用快捷键还包括`alt + 左右方向键`切换跳转记录

> 在目录index文件中统一收集方法并导出是一种实用技巧，例如工具目录utils将各类型工具子目录中的方法统一导出后，引入只需要写`import {xxx} from '@/utils'`。可以降低路径记忆负担，增加效率

## Axios类

axios的一切操作始于原始类Axios(lib/core/Axios.js)，其中的逻辑比较简单：

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

所以request方法第一步便是检查以及矫正参数：

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

`transitional`无法在官方文档提供的参数中找到，但通过搜索能在`README.md 546行`中找到说明，这是一个兼容老版本的过渡选项，之后可能会被移除。其作用是定义JSON解析的规则，包括JSON解析错误是否忽略；是否强制通过JSON转换响应；是否修改请求超时抛出的错误。源码中通过`validator.assertOptions`方法检查了该参数属性是否正确

`paramsSerializer`同样检查了内部属性是否正确，其作用是自定义序列化请求参数的方式，例如[官方示例](https://axios-http.com/zh/docs/req_config)中通过Qs库转换数组作为查询参数:

```js
/**
   get请求方式传参称为query（查询参数），传递数组时有几种不同的转换形式
   例如axios.get('xxx',{arr:[1,2]})时，不同的arrayFormat对应生成的参数为：
   indices：arr[0]=1&arr[1]=2
   brackets：arr[]=1&arr[]=2
   repeat：arr=1&arr=2
 */
  paramsSerializer: function (params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
  },
```

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

// 通过Object.defineProperty向obj中添加请求头操作方法
// 'get xxx'，'set xxx'，'has xxx'
// 在下面的accessor静态方法中被调用时，是将AxiosHeaders类原型传入了obj
// 所以当访问上面三个属性时，相当于调用的AxiosHeaders['get xxx']
// this是AxiosHeaders，实际也就是执行了AxiosHeaders类中的get、set、has方法
function buildAccessors(obj, header) {...}

class AxiosHeaders {
  // 接收header存入实例中，支持对象，字符串
  // 通过!isValidHeaderName(header)判断字符串不是简单的命名字符串
  // 通过parseHeaders(lib/helpers/parseHeaders.js)解析字符串，以换行\n分隔数据，每一行以冒号:分隔键值对
  // set-cookie项存为数组，其余项键同名的以逗号拼接值存储
  set(header, valueOrRewrite, rewrite) {...}
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
  // use方法还支持第三个参数，配置拦截器是异步还是同步执行以及执行时机
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
  // 只要有一个拦截器是异步的，则同步标记设为false
  synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
  // 向请求拦截队列队首添加拦截器
  requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
});

// 创建响应拦截队列
const responseInterceptorChain = [];
this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
  // 向响应拦截队列队首添加拦截器
  responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
});

let promise;
let i = 0;
let len;

if (!synchronousRequestInterceptors) {
  const chain = [dispatchRequest.bind(this), undefined];
  chain.unshift.apply(chain, requestInterceptorChain);
  chain.push.apply(chain, responseInterceptorChain);
  len = chain.length;

  promise = Promise.resolve(config);

  while (i < len) {
    promise = promise.then(chain[i++], chain[i++]);
  }

  return promise;
}

len = requestInterceptorChain.length;

let newConfig = config;

i = 0;

while (i < len) {
  const onFulfilled = requestInterceptorChain[i++];
  const onRejected = requestInterceptorChain[i++];
  try {
    newConfig = onFulfilled(newConfig);
  } catch (error) {
    onRejected.call(this, error);
    break;
  }
}

try {
  promise = dispatchRequest.call(this, newConfig);
} catch (error) {
  return Promise.reject(error);
}

i = 0;
len = responseInterceptorChain.length;

while (i < len) {
  promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
}

return promise;
```
