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
2. 在实例对象`interceptors`属性中初始化基础的`request`、`response`拦截器
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

之后通过`AxiosHeaders.concat`静态方法
