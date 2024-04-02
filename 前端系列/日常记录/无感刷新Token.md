# 无感刷新 Token

`JWT` 已经在 HTTP 鉴权中被广泛使用，但普通方案中 Token 到期后用户就需要重新登录，为了安全性也不能将 Token 有效期设置的过长。

为了解决这个问题，可以使用的方案包括：

1. 后端额外返回 Token 过期时间，前端开启定时任务或在请求前判断是否临期，并重新获取 Token。
2. 后端返回 `AccessToken` + `RefreshToken`，前端使用 AccessToken 鉴权，鉴权失败后使用 RefreshToken 重新获取两个 Token。
3. 后端通过响应头返回 Token，前端只要拦截到响应头存在 Token 就重新保存。后端在 Token 临近过期（或过期不久）时返回新的 Token。

第一种方案依赖于用户系统时间，不建议使用。

第二种方案是最常用的方案，需要特别注意刷新 Token 期间其他请求和响应的处理。

第三种方案是我个人使用过的方案，同样需要注意处理刷新 Token 期间收到的请求，与第二种方案不同在于处理是放在服务端的。后端判断 Token 过期时间也可以改为双 Token 的方式，后端判断 AccessToken 过期但 RefreshToken 未过期。

**下文主要介绍第二种主流方案的实现方式，其他方案处理类似。**

## 生成 Token

以 `NestJS` 为例，使用 `@nestjs/jwt` 库可以很方便的生成 Token。

安装后通常将 `JwtModule` 注册为全局模块，便于其他模块中使用：

```ts
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.register({
      global: true, // 开启后会将写在这里的配置应用于全局
      secret: process.env.JWT_SECRET, // 设置加密密钥
    }),
  ],
})
export class AppModule {}
```

使用时注入 `JwtService` 便能够通过 `sign` 方法生成 Token，和 `verify` 方法验证 Token。在登录接口中生成并返回 Token：

```ts
import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Controller("user")
export class UserController {
  // 注入 JWT 服务
  constructor(private readonly jwtService: JwtService) {}

  // 登录接口
  @Post("login")
  @HttpCode(200) // Post 默认响应 201
  async login(@Body() user: LoginDto) {
    // 1. 根据登录信息查询用户信息 - user
    // 2. 判断密码是否正确
    // 3. 生成 AccessToken，设置较短的过期时长，签名设置为用户 ID
    const accessToken = await this.jwtService.signAsync(
      { id: user.id },
      {
        expiresIn: "1h",
      }
    );
    // 4. 生成 RefreshToken,设置较长的过期时长
    const refreshToken = await this.jwtService.signAsync(
      { id: user.id },
      { expiresIn: "7d" }
    );
    // 返回信息
    return { ...user, accessToken, refreshToken };
  }
}
```

前端接收到登录响应后，需要本地存储 AccessToken 和 RefreshToken。并通过请求拦截器，在请求前统一添加 Token 请求头即可保持登录状态，相关代码这里不再赘述。

## 后端鉴权

前端通过 Token 传递身份信息，在后端可以创建一个登录守卫（`Guard`），在需要鉴权的接口前判断是否登录。

创建 `login.guard.ts` 文件：

```ts
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { PrismaService } from "../global/prisma.service";

@Injectable()
export class LoginGuard implements CanActivate {
  // 注入 JWT 服务
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 获取请求信息
    const http = context.switchToHttp();
    const request: Request = http.getRequest();
    const response: Response = http.getResponse();
    // 从请求头获取 Token
    const token = request.header("Token");
    // 没有 Token 抛出 401 错误
    if (!token) {
      throw new UnauthorizedException();
    }

    // 校验 Token
    return this.jwtService.verifyAsync(token).then(async ({ id }) => {
      // 这里省略获取用户信息 - user
      // 签名内容错误，抛出 401 错误
      if (!user) {
        throw new UnauthorizedException("登录已失效，请重新登录！");
      }
      // 否则通过校验
      return true;
    });
  }
}
```

定义登录守卫后在需要鉴权的接口或模块中应用守卫即可：

```ts
import { LoginGuard } from "./login.guard";

@Controller("any-controller")
@UseGuards(LoginGuard) // 整个模块使用，也可以只定义在单个接口上
export class AnyController {
  // ...
}
```

## 刷新 Token

当前端收到 `401` 响应时，需要进行判断是未登录（不存在 Token）还是 AccessToken 过期，如果存在 Token，尝试调用刷新 Token 接口。

以 Axios 拦截器为例，关键代码为：

```ts
axios.interceptors.response.use(
  (response) => {
    // 正常响应处理
  },
  (error) => {
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem("RefreshToken");
      if (!refreshToken) {
        // 如果没有 Token，直接跳转登录
      }
      // 否则请求刷新 Token 接口
      return axios
        .post("/user/refresh", { refreshToken })
        .then((response) => {
          // 刷新成功后重置 Token 本地存储和请求头
          // axios.defaults.headers.common.Authorization = ``;

          // 重发请求
          return axios(error.config);
        })
        .catch(() => {
          // 刷新失败，跳转登录
        });
    }
    // 其他处理...
  }
);
```

后端刷新接口也比较简单：

```ts
import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Controller("user")
export class UserController {
  // 注入 JWT 服务
  constructor(private readonly jwtService: JwtService) {}

  @Post("refresh")
  @HttpCode(200) // Post 默认响应 201
  async refersh(@Body() { refreshToken }: RefreshDto) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    // 校验 Token
    return this.jwtService
      .verifyAsync(accessToken)
      .then(async ({ id }) => {
        // RefreshToken 未过期
        // 还需要判断签名 id 是否正确
        // 判断通过后生成新 Token 返回
        const accessToken = await this.jwtService.signAsync(
          { id: user.id },
          {
            expiresIn: "1h",
          }
        );
        const refreshToken = await this.jwtService.signAsync(
          { id: user.id },
          { expiresIn: "7d" }
        );
        return { accessToken, refreshToken };
      })
      .catch(() => {
        // 校验失败，抛出错误
        throw new UnauthorizedException();
      });
  }
}
```

## 连续请求处理

在刷新 Token 期间，如果有新的请求，应该让这些请求持续 Pending 状态，等刷新之后再重发或者失败。

如果多个连续请求，第一个响应 `401` 并尝试刷新 Token 后，后续的 `401` 响应不应该再触发刷新。

如果只考虑新的请求，在请求拦截中判断是否正在刷新可以避免发出多余的请求。但因为第二种连续请求的情况，所以全部在响应拦截中处理会更加简单：

```ts
// 刷新标记
let isRefreshing = false;
// 等待队列，Token 刷新后再处理
const requests = [];

axios.interceptors.response.use(
  (response) => {
    // 正常响应处理
  },
  (error) => {
    if (error.response.status === 401) {
      // 如果正在刷新，
      if (isRefreshing) {
        // 返回 Pending 状态的 Promise，等刷新后再处理
        return new Promise((resolve) => {
          // 将任务加入等待队列，刷新完成后取出重新执行
          requests.push(() => {
            resolve(axios(response.config));
          });
        });
      } else {
        // 未开始刷新
        const refreshToken = localStorage.getItem("RefreshToken");
        if (!refreshToken) {
          // 如果没有 Token，直接跳转登录
        }
        // 否则请求刷新 Token 接口
        isRefreshing = true;
        return axios
          .post("/user/refresh", { refreshToken })
          .then((response) => {
            // 刷新成功后重置 Token 本地存储和请求头
            // axios.defaults.headers.common.Authorization = ``;

            // 重新执行等待队列中的请求
            for (req of requests) {
              req();
            }

            // 重发请求
            return axios(error.config);
          })
          .catch(() => {
            // 刷新失败，跳转登录
          })
          .finally(() => {
            // 刷新后清空队列已经关闭刷新标记
            requests = p[];
            isRefreshing = false;
          });
      }
    }
    // 其他处理...
  }
);
```
