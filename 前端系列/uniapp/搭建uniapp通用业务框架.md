# 搭建uniapp通用业务框架

**仓库地址：https://github.com/Xaviw/uniapp-template**

当前`1.0`版本仅是根据自身业务需求搭建的一套跨端应用开发框架，本人经验有限，功能与开发体验并没有特别完善，例如没有权限控制功能，没有做全端的兼容性处理等...

开发这个仓库的初衷是让自身业务开发中框架更为易用，以及提升自己逻辑抽离、封装能力。如果业务需求不复杂，可以尝试直接使用本框架。或者同样处在学习阶段的朋友，可以尝试阅读仓库源码可能能够得到部分业务框架搭建灵感

> 该项目为HBuilderX下使用的模板，可以参考另一个仓库[HBuilderX-Settings](https://github.com/Xaviw/HBuilderX-Settings)设置HBuilderX编辑器代码格式化等相关功能

## 技术栈

- uni-app
- Vue 2.x
- Vuex(HBuilderX 内置，不用安装)
- uview-ui 2.x

  通过插件市场导入uni_modules，相比于npm安装多了代码提示，使用前先右击**uni_modules/uview-ui->从插件市场更新**

## 项目配置

根目录下`config.js`文件中已书写了模板用到的公共配置项，可以搜索配置项查看用途后按需填写，可以自由添加其他配置项

> 部分方法中可能需要修改的部分已用`FIX`注释标注，可以全局搜索并查看是否需要修改

## 样式

1. 定义了类似Tailwind的常用css类，查看`style/common.scss`、`style/generate.scss`，`generate`默认生成范围为`0-30`，可以自行修改文件顶部的配置项
2. 按需在`style/uview.theme.scss`中替换uview主题颜色，uview组件样式并不是直接使用的主题色变量，所以还需要单独配置组件
3. 按需在`style/setUViewConfig.js`中自定义uview组件配置，参考[官网介绍](https://www.uviewui.com/components/setting.html#修改uview内置配置方案)

### CSS类列表

基础样式查看`style/common.scss`文件，同时uview也提供了部分css类，可以查看`uview-ui/libs/css/`下的文件，较为实用的有：

|        名称         |         对应样式         | 范围  |
| :-----------------: | :----------------------: | :---: |
|    u-main-color     |   color: $u-main-color   |       |
|   u-content-color   | color: $u-content-color  |       |
|    u-tips-color     |   color: $u-tips-color   |       |
|    u-light-color    |  color: $u-light-color   |       |
|      u-line-x       |       文本多行省略       |  1-5  |
|   u-reset-button    | 去除button的所有默认样式 |       |
|      u-border       |       默认边框样式       |       |
|    u-border-top     |                          |       |
|    u-border-left    |                          |       |
|   u-border-right    |                          |       |
|   u-border-bottom   |                          |       |
| u-border-top-bottom |                          |       |

`generate.scss`文件中提供了四个变量：

```scss
$num: 0; // 循环生成初始点
$sum: 30; // 循环生成终点
$step: 2; // 步长，由于设计稿2rpx=1px，故此处步长为2
$unit: 'rpx'; //单位
```

按上诉设置后，`w-#{$num}`会对应`width: #{$num * $step}#{$unit}`，即`w-10`对应`width: 20rpx`

颜色变量使用了[uview主题色变量](https://www.uviewui.com/components/color.html)，使用格式为`name-type`或`name-type-level`，name对应设置的对象，例如`bg -> background`；type对应主题，uview中包括`primary`、`success`、`warning`、`error`、`info`；level对应颜色的深浅，包括`dark`、`disabled`、`light`，不写level时即为默认的主题颜色

使用时`bg-primary`对应`background-color: $u-primary`，`text-primary-dark`对应`color: $u-primary-dark`

**后续使用`x`代替类名中的`num`，使用`y`代替生成的值，不再重复书写**

|              名称              |        对应样式        |          范围          | 兼容性 |
| :----------------------------: | :--------------------: | :--------------------: | :----: |
|              w-x               |        width: y        |      0-60(sum*2)       |        |
|              h-x               |       height: y        |      0-60(sum*2)       |        |
|              p-x               |       padding: y       |          0-30          |        |
|              px-x              |      padding: 0 y      |          0-30          |        |
|              py-x              |      padding: y 0      |          0-30          |        |
|              pt-x              |    padding: y 0 0 0    |          0-30          |        |
|              pr-x              |    padding: 0 y 0 0    |          0-30          |        |
|              pb-x              |    padding: 0 0 y 0    |          0-30          |        |
|              pl-x              |    padding: 0 0 0 y    |          0-30          |        |
|              p-x               |       margin: y        |          0-30          |        |
|              mx-x              |      margin: 0 y       |          0-30          |        |
|              my-x              |      margin: y 0       |          0-30          |        |
|              mt-x              |    margin: y 0 0 0     |          0-30          |        |
|              mr-x              |    margin: 0 y 0 0     |          0-30          |        |
|              mb-x              |    margin: 0 0 y 0     |          0-30          |        |
|              ml-x              |    margin: 0 0 0 y     |          0-30          |        |
|            border-x            |    border-width: y     |          0-30          |        |
|           border-t-x           |  border-top-width: y   |          0-30          |        |
|           border-r-x           | border-right-width: y  |          0-30          |        |
|           border-b-x           | border-bottom-width: y |          0-30          |        |
|           border-l-x           |  border-left-width: y  |          0-30          |        |
|           rounded-x            |    border-radius: y    |          0-30          |        |
|            leding-x            |     line-height: y     |          0-30          |        |
|              t-x               |         top: y         |          0-30          |        |
|              r-x               |        right: y        |          0-30          |        |
|              b-x               |       bottom: y        |          0-30          |        |
|              l-x               |        left: y         |          0-30          |        |
|             text-x             |      font-size: y      |          0-30          |        |
|     bg-type或bg-type-level     |  background-color: y   | 查看上方颜色变量的介绍 |        |
|   text-type或text-type-level   |        color: y        | 查看上方颜色变量的介绍 |        |
| border-type或border-type-level |    border-color: y     | 查看上方颜色变量的介绍 |        |
|              z-x               |       z-index: x       |          0-30          | 非NVUE |
|             w-p-x              |   width: ${num*10}%    |          1-10          | 非NVUE |
|             h-p-x              |   height: ${num*10}%   |          1-10          | 非NVUE |

### 页面样式

App.vue中设置了全局的根样式

```scss
// APP NVUE页面不支持标签样式，此处定义类样式是可以vue、nvue通用的
// APP NVUE页面默认字号18px，其他默认字号16px
// 除H5外，page标签样式只能写在非scope style中
page {
  // font-size: 28rpx;
  color: $u-content-color;
  background-color: $u-bg-color;
}
```

NVUE页面不支持标签样式，需要单独定义。`pages.json -> globalStyle -> app-plus -> background`属性与这里的背景色设置一致，便能保证所有页面背景色统一

另外`pages.json`文件中对其他样式属性做了说明，可以按需求进行修改

### 扩展图标

如果有扩展图标的需求，请在[iconfont](https://www.iconfont.cn/)中将图标保存至一个项目后，按uview官方指南-[CustomIcon 扩展自定义图标库](https://www.uviewui.com/guide/customIcon.html)进行操作

## 请求

使用了[luch-request](https://www.quanzhan.co/luch-request/guide/3.x/)库处理请求，相关配置定义在`network/request.js`中。请求接口定义在根目录api文件夹下，定义方式已有例子，如需额外的请求器实例，参考`api/external.js`文件与`network/request.js`文件，重新定义一个实例即可

同时还扩展了几个自定义属性：

```js
{
  // 是否返回原始响应数据 比如：需要获取响应头时使用该属性
  isReturnNativeResponse: false,
  // 请求是否加入时间戳
  joinTime: false,
  // GET请求失败重试
  retryRequest: {
    isOpenRetry: true,
    count: 2,
    waitTime: 1000,
  },
};
```

除了上面的默认配置外，api中单独配置方式为：

```js
// api/xxx.js
export default fetchData = data => uni.$u.http.post('/data', data, {
  custom: { isReturnNativeResponse: true }
})

export default fetchData = params => uni.$u.http.get('/data', {
  params,
  custom: { joinTime: true }
})
```

另外在响应对象中扩展了`cancelOrResetToast`属性，作用为取消或手动设置`request.js`中触发的提示信息：

``` js
import {fetchData} from '@/api/xxx.js'

fetchData()
  .then(
    // ...
  )
  .catch(response => {
    // 比如fetchData返回500，默认会显示提示信息"服务器错误，请稍后再试！"
    // 直接调用后则不展示提示信息
    response.cancelOrResetToast()
    // 也可以覆盖提示信息
    response.cancelOrResetToast('服务器挂了')
  })
```

## WebSocket

`network/socket.js`中定义了通用webSocket类，使用方式：

```js
import Socket from '@/network/socket.js'

/**
 * @param {string} url - websocket地址
 * @param {number} [reconnectInterval=5*1000] - 重连间隔时长（毫秒）
 * @param {boolean} [useHeartbeat=false] - 是否开启心跳机制
 * @param {number} [heartbeatInterval=30*1000] - 心跳间隔时长（毫秒）
 * @param {string|function} [heartbeatData='heartbeat'] - 心跳发送内容或返回内容的函数
 * @param {function} [onOpen] - onOpen时触发的钩子函数，例如socket登录
 * @param {function} [onClose] - onClose时触发的钩子函数
 */
uni.$socket = new Socket({
  // ...
})

uni.$on('socketMessage', (msg) => {
  // ...
})

uni.$socket.disconnect()
```

socket消息处理定义在`utils/socketUtil.js`中，用策略模式分别处理对应的消息类型

如果用到了protobuf序列化，需要替换`libs/proto.js`文件。在`utils/protobufUtil.js`中定义了`decode`、`encode`、`deserialize`方法:

```js
import { encode, decode, deserialize } from '@/utils/protobufUtil.js'

const strategies = [
  {
    type, // commandId，因为protobuf中commandId是唯一的，不需要连同serviceId一起判断
    parser, // protobuf解析方法
    handler: msg => {
      // 这里的msg已经是decode后的数据
      // 可以使用deserialize解析其中的json数据
      const data = deserialize(msg.data)
    },
  },
]
```

## 自动更新

项目内采用[upushy](https://ext.dcloud.net.cn/plugin?id=4200)提供的更新策略，upushy后台配置好应用后，填写`config.js`中相关配置即可使用

## npm库

> 根据需要增删，建议尽量用lodash-es中的方法，uview自带的部分方法不够严谨

1. lodash-es

```js
import { cloneDeep } from 'lodash-es'
```

2. js-base64

```js
import {Base64} from 'js-base64';
Base64.encode(data)
base64.decode(data)
```

3. js-md5

```js
import md5 from 'js-md5'
md5(data)
```

4. json-bigint

socket推送的超长数字，需要使用json-bigint解析，不能直接JSON.parse

```js
import JSONBig from 'json-bigint'

const parse = JSONBig({ storeAsString: true }).parse
parse(data)
```

5. tki-qrcode

  生成二维码组件`<tki-qrcode :size="320" :val="val" loadMake />`

## 内置组件

1. `captcha`组件传入字符生成图像验证码`<captcha :code="code" @click.native="fetchCode" />`
2. `sliderVerify`组件为滑动解锁组件，按需求修改内部实现`<slider-verify :text="text" @success="handleNext" :disabled="disabled" ref="verify">`

## 内置工具

`uview`内置了部分实用工具函数，查看[官网介绍](https://www.uviewui.com/js/intro.html)

还有部分函数未暴露到`$u`中，可以手动引入使用，详细可以查看源码`@/uni_modules/uview-ui/libs/`

```js
import dayjs from '@/uni_modules/uview-ui/libs/util/dayjs.js'
```

此外utils目录下定义了部分常用工具函数:

```js
// 手机号、银行卡号脱敏
import { hideMobile, hideBankCard } from '@/utils/formatter.js'
// 高精度计算
import { add, minus, multiply, divide } from '@/utils/helper.js'
// uni定位方法promise化
import { getLocation, isSameLocation } from '@/utils/mapUtil.js'
// 系统原生语音播放，仅APP
import audioPlay from '@/utils/speechSynthesis.js'
// 密码校验、银行卡号校验
import { checkPwd, checkBankCard } from '@/utils/test.js'
```
