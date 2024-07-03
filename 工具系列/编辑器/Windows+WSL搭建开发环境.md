---
hide: true
---

# Windows + WSL 搭建开发环境

常听说 Mac 更适用于开发，主要是因为 Mac 既拥有 Windows 系统一样丰富的生产力软件，又拥有 Unix 系统一样好用的命令行等工具

但其实 Windows 也能拥有这两种能力，只需要借助 [WSL](https://learn.microsoft.com/zh-cn/windows/wsl/)

> WSL 即 Windows Subsystem for Linux，是 Windows 官方提供的一项功能，用于在 Windows 系统上运行 Linux 环境。目前仅支持 Windows 10 19041 及更高版本

## WSL 的优势

1. 支持各种 Linux 发行版，与虚拟机相比所需的资源更少
2. Windows 和 Linux 无缝集成，支持文件互访问、应用程序互操作
3. 通过在 Windows 和 Linux 之间建立一个轻量级虚拟化层实现了媲美原生 Linux 的性能
4. 结合 VSCode 有良好的开发体验（Windows 软件 + Linux 工具）

## 安装 WSL

> 后续的安装过程可能会因为国内网络原因失败，建议打开代理

在管理员模式下打开 PowerShell 或命令提示符，执行：

```shell
wsl --install
```

这会默认安装 Ubuntu，可以参照[官网介绍](https://learn.microsoft.com/zh-cn/windows/wsl/install#change-the-default-linux-distribution-installed)安装其他发行版

安装完成后重启电脑，在开始菜单中打开 `Ubuntu`，打开后输入用户名和密码创建默认用户（会被视为管理员）

之后可以通过命令升级包：

```shell
sudo apt update && sudo apt upgrade
```

## 安装 Windows Terminal

Windows Terminal 是更强大的命令行运行程序，支持多选项卡、多窗格、自定义主题等功能

使用 Windows Terminal 配置 WSL 使用，能够得到更好的体验。安装和配置 Windows Terminal 可以参考[官方教程](https://learn.microsoft.com/zh-cn/windows/wsl/setup/environment#set-up-windows-terminal)

## 安装 zsh

bash 是 Linux 中默认的命令行工具，zsh 是 bash 的扩展版本，具有更多的功能和更好看的外观，配合 oh-my-zsh 的插件，可以提供命令高亮、命令补全、git 快捷键等
