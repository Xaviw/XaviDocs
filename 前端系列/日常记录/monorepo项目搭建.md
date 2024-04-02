---
hide: true
---

# monorepo 项目搭建

`monorepo` 也就是多包项目，指的是将多个项目存放在一个仓库（文件夹）中进行管理。相对于普通的单包项目（`multirepo`），最大的好处是项目间引用更便捷，关联包更新后无需经过打包、发布、安装新版本等步骤就能够直接使用。

monorepo 有多种搭建方式，目前主流（`Vue3` 采用）是使用 `pnpm` 搭建的方式。本文是在 [`spatial-planning`](https://github.com/Xaviw/spatial-planning) 项目后本人对 `pnpm monorepo` 的一些理解。

## 搭建

首先需要安装 pnpm，推荐使用 `corepack`。安装后创建项目：

```sh
mkdir monorepo-test
cd monorepo-test
pnpm init
```

使用 pnpm monorepo 需要在根目录下新建 `pnpm-workspace.yaml` 文件，并写入子包的配置，默认配置为：

```yaml
packages:
  - "packages/*"
```
