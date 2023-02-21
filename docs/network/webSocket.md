# WebSocket

> TCP/IP协议的子集，在单个TCP连接上进行全双工通信的协议

## 特点
1. 协议标识符是ws或wss，默认端口同HTTP为80或443
2. 客户端、服务端均可推送消息
3. 没有同源限制

## 工作流程

需要借助HTTP或者其他协议建立连接

1. 发起变更协议请求

```
请求：
  GET / HTTP/1.1
  Connection: Upgrade
  Upgrade: websocket
  Sec-WebSocket-Key: 随机字符串，服务器使用这个字符串+特定字符串后进行sha1运算，然后以Base64格式返回
  Sec-WebSocket-Version: 版本

响应：
  HTTP/1.1 101 Switching Protocols
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Accept: 服务器运算后的字符串，客户端解析判断协议是否正确
  Sec-WebSocket-Location: 请求地址, ws://xxx, wss://xxx
```

2. 链接建立是异步的，需要在发送消息前侦听握手完成情况

3. 断开连接可以暴力断开TCP连接，之后会异常触发onClose。常规的断开是发送断开请求，对方响应确认断开后会触发onClose

## 设计策略

### 感知重连

需要重连的场景可以大致分为：

1. 连接断开

直接重连

2. 连接不可用
   


3. 服务不可用

规定时间内未收到心跳回复
