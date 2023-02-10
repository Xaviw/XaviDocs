# Axios源码解析

## 下载源码

**深入理解建议对照源码阅读**

```git
git clone --depth 1 https://github.com/axios/axios.git
```

## 基础API

> 阅读源码前先熟悉库实际的使用方式以及各种API有助于找到阅读的切入点，[官方中文文档](https://axios-http.com/zh/docs/intro)

axios库基于核心类`Axios`(`lib/core/Axios.js`)，在库中默认导出了一个名为`axios`的实例对象，并传入了`lib/defaults/index.js`中写好的基础配置defaultConfig

使用中所有的操作通常基于默认导出的实例对象`axios`实现。当然也可以自己导入Axios类，手动定义全部配置后新建实例使用

基础API有：

1. instance.defaults
   设置实例的基础参数，与初始化实例时的defaultConfig合并，作为该实例的参数

2. instance.interceptors
   配置实例拦截器

3. instance(config)
   发起请求的核心API，`.request`，`.get`，`.post`等方法都是基于此核心方法

   传入的config会与实例参数再次合并，作为实际请求参数

4. instance.create(config)
   基于当前实例对象创建新的实例对象，config与当前实例参数合并作为新实例的参数

## Axios类

Axios类中的代码比较简单：

1. 将传入的配置存入defaults对象中
2. 在interceptors对象中初始化基础的request、response拦截器
3. 
