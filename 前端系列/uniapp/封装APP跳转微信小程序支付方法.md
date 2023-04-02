# 封装APP跳转微信小程序支付方法

相比于安卓应用开通第三方支付或苹果应用开通内购支付，会有较复杂的资质要求以及部分手续费。跳转微信小程序页面进行支付是一种更加容易的支付方案

本文介绍个人在使用`uniapp`中封装`APP`跳转小程序支付的思路，而不会介绍微信小程序中支付相关使用方法

## 思路

跳转微信小程序支付，重点在于跳转后检查支付状态。可以在点击支付后全局存储支付`ID`，因为支付后返回`APP`会触发`onShow`，所以在`App.vue`的`onShow`方法中判断如果当前全局有存储支付`ID`，则通过`API`检查支付状态

## 跳转小程序支付页面

`HTML5+ API`中提供了调用终端软件的`share`模块，可以通过`plus.share.getServices`方法遍历出微信服务，并调用小程序打开对应支付页面。可以将这一系列流程封装成通用的方法：

```js
// parmas是传递给支付页面的支付参数，可以使用qs库等接收对象后再转为query参数
export function wxPayment(params) {
  return new Promise((resolve, reject) => {
    plus.share.getServices(services => {
      // 获取微信服务
      const wx = services.find(item => item.id === 'weixin')
      // naticeClient表示终端是否已安装对应客户端
      if(wx.nativeClient){
        const launchOptions = {
          id: 'xxx', // 微信小程序原始ID（"g_"开头的字符串）
          type: 0, // 微信小程序版本类型： 0-正式版； 1-测试版； 2-体验版。 默认值为0
          path: `/xxx${qs.stringify(params)}`, // 跳转页面
        }
        wx.launchMiniProgram(launchOptions, () => {
          // 存储支付订单id供返回APP时检查支付状态
          this.$store.commit('setPaymentId', params.id)
          // 监听检查支付状态的结果
          uni.$once('paymentResult', (id, state) => {
            if (id !== params.id) return
            if (state) {
              uni.showToast({title: '支付成功！'})
              resolve()
            } else {
              uni.showToast({title: '支付失败，请重新支付！'})
              reject()
            }
          })
        })
      } else {
        uni.showToast({title: '请先安装微信！'})
        reject()
      }
    })
  })
}
```

## 检查支付状态

```js
// App.vue
onShow(){
  const paymentId = this.$store.state.paymentId
  if(paymentId) {
    uni.showLoading({title: '获取支付状态中'})
    // 调用检查支付状态的api
    fetchPaymentStatus({id: paymentId})
      .then(state => {
        // 发射支付检查结果
        uni.$emit('paymentResult', paymentId, state)
      })
      .catch(() => {
        uni.showToast({title: '网络错误，请刷新后查看支付结果'})
        uni.$emit('paymentResult', paymentId, false)
      })
      .finally(() => {
        // 检查完毕清空存储的支付Id
        this.$store.commit('setPaymentId', null)
        uni.hideLoading()
      })
  }
}
```

## 使用

完成上面的两步操作后便能快捷的进行支付操作，封装方法中还可以对网络错误、支付失败、未安装微信抛出不同的错误码，以便进行更精细的操作

```vue
<templace>
  <button @click="payment">支付</button>
</templace>

<script>
import { wxPayment } from '@/utils.js'

export default {
  methods: {
    payment(){
      wxPayment({id: 'xxx'})
        .then(() => {
          // 支付成功后操作，例如跳转支付成功页面
          uni.redirectTo({url: '/pages/paymentSuccess'})
        })
        .catch(err => {
          // 支付失败操作，可以自定义不同情况返回的错误码，并针对处理
          ...
        })
    }
  }
}
</script>
```
