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

> 安装过程可能会因为国内网络原因失败，需要打开代理

在管理员模式下打开 PowerShell 或命令提示符，执行：

```shell
wsl --install
```

这会默认安装 Ubuntu，可以参照[官网介绍](https://learn.microsoft.com/zh-cn/windows/wsl/install#change-the-default-linux-distribution-installed)安装其他发行版

安装完成后重启电脑，在开始菜单中打开 `Ubuntu`，打开后根据提示输入用户名和密码创建默认管理员用户

<Image src="../../images/工具系列/Windows+WSL搭建开发环境-0.png" alt="创建管理员用户" />

之后通过命令升级系统中的包：

```shell
sudo apt update && sudo apt upgrade
```

通过 `apt list --installed` 命令可以看到 Ubuntu 默认安装的包，包括了 `curl`、`git`、`wget` 等

如果没有默认安装这些包，可以通过 `sudo apt install` 命令手动安装

## 安装 Windows Terminal

Windows Terminal 是更强大的命令行运行程序，支持多选项卡、多窗格、自定义主题等功能

使用 Windows Terminal 配置 WSL 使用，能够得到更好的体验。安装和配置 Windows Terminal 可以参考[官方教程](https://learn.microsoft.com/zh-cn/windows/wsl/setup/environment#set-up-windows-terminal)

安装完成后可以在 **设置 -> 启动 -> 默认配置文件**中将 Ubuntu 设置为默认启动

## 安装 zsh

bash 是 Linux 中默认的命令行工具，zsh 是 bash 的扩展版本，具有更多的功能和更好看的外观，配合 oh-my-zsh 的插件，可以提供命令高亮、命令补全等功能

安装 zsh：

```shell
sudo apt install zsh
```

设置 zsh 为默认命令行：

```shell
chsh -s $(which zsh)
```

运行后需要输入密码，之后重启终端即可看到设置生效了，也可以通过 `echo $SHELL` 命令查看当前命令行是否是 `/bin/zsh`

## WSL 使用 Windows 代理

WSL2 的网络是连接自 Windows 的一个单独网络，所以无法直接使用到 Windows 中开启的代理，但是可以通过设置代理为 Windows IP + 代理端口号实现

首先在代理软件中开启“允许来至局域网的连接”

<Image alt="代理软件设置" src="../../images/工具系列/Windows+WSL搭建开发环境-1.png" />

“本机 sockets 端口”对应的端口号也就是 Windows 代理的端口号（图中是 10808，http 端口需要 +1，所以需要使用 10809）

Windows IP 地址是可能变化的，可以利用上面提到的 WSL 网络连接自 Windows 这一点，从 `/etc/resolv.conf` 文件中自动获取

之后通过 `code ~/.zshrc` 或 `vim ~/.zshrc` 在 zsh 配置中添加:

```shell
host_ip=$(cat /etc/resolv.conf | grep "nameserver" | cut -f 2 -d " ")
proxy_port=10809
alias proxy="all_proxy=http://$host_ip:$proxy_port"
```

配置后需要重启命令行或通过 `. ~/.zshrc` 命令刷新配置

之后在需要代理的命令前添加 `proxy` 命令即可，可以通过 curl 命令测试：

```shell
curl www.google.com # 失败

proxy curl www.google.com # 成功
```

<Image alt="proxy测试" src="../../images/工具系列/Windows+WSL搭建开发环境-2.png" />

## 安装 oh-my-zsh

安装：

```shell
proxy curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh | sh
```

安装完成后可以看到如下打印：

<Image alt="oh-my-zsh" src="../../images/工具系列/Windows+WSL搭建开发环境-3.png" />

oh-my-zsh 支持插件机制，常用的插件包括:

- `git`：在命令行显示当前仓库分支名称，以及提供一些 Git 便利功能和命令别名
- `z`：会记录在命令行中经常访问的目录，输入 z + 目录部分名称，会自动匹配最可能的位置
- `zsh-syntax-highlighting`：提供语法高亮功能
- `zsh-autosuggestions`：根据历史命令提供建议

git 和 z 插件已经自带，后两个插件可以通过以下命令安装：

```shell
git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/plugins/zsh-syntax-highlighting

git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/plugins/zsh-autosuggestions
```

oh-my-zsh 还支持切换主题，默认安装的主题可以通过 `ls ~/.oh-my-zsh/themes` 命令或直接在 Windows 文件管理器 `\\wsl.localhost\Ubuntu\home\[username]\.oh-my-zsh\themes` 路径中查看，也可以在 [官方 Github](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes) 中查看名称对应的效果

除了默认主题，还有很多第三方主题，其中好评最多的是 [Powerlevel10k](https://github.com/romkatv/powerlevel10k)，可以通过以下命令安装：

```shell
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/.oh-my-zsh/custom/themes/powerlevel10k
```

插件与主题全部安装后需要通过 `code ~/.zshrc` 或 `vim ~/.zshrc` 修改配置文件中如下两条命令：

```shell
ZSH_THEME="powerlevel10k/powerlevel10k"

plugins=(git z zsh-autosuggestions zsh-syntax-highlighting)
```

之后通过 `. ~/.zshrc` 命令刷新配置，即可看到进入了 powerlevel10k 主题的配置流程，按照指引一步步完成配置即可。

<div style="display: flex; justify-content: center;">
  <Image alt="powerlevel10k配置" src="../../images/工具系列/Windows+WSL搭建开发环境-4.png" style="margin-right: 2rem;" />
  <Image alt="powerlevel10k" src="../../images/工具系列/Windows+WSL搭建开发环境-5.png" />
</div>

## 设置开发环境

通过版本管理器安装 nodejs 是更佳的选择，这里以 nvm 为例：

```shell
proxy curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

安装完成后可能会有错误信息，根据信息重启终端即可

```
internal/modules/cjs/loader.js:934
  throw err;
  ^

Error: Cannot find module '\\wsl.localhost\Ubuntu\mnt\d\Program Files\nodejs\node_modules\npm\bin\npm-cli.js'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:931:15)
    at Function.Module._load (internal/modules/cjs/loader.js:774:27)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:75:12)
    at internal/main/run_main_module.js:17:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}
=> Close and reopen your terminal to start using nvm or run the following to use it now:

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

重启后输入 `nvm -v`，正确打印版本号即为安装成功，之后设置开发环境：

```shell
# 安装 nodejs lts 版本
nvm install --lts

# 建议使用 corepack 安装 pnpm 和 yarn
corepack enable

# 初始化 pnpm 环境变量
pnpm setup

# 重新加载配置
. ~/.zshrc

# 全局安装 nrm
pnpm i -g nrm

# 切换国内源
nrm use taobao
```

如果有私有 npm 源的需求，还可以通过如下命令添加到 nrm 中：

```shell
# 添加
nrm add [name] [registry]

# 切换
nrm use [name]
```

添加后如有鉴权需求，在项目或全局的 .npmrc 文件中写入配置即可使用

通常还需要对 Git 进行设置：

```shell
# 设置 git 用户名
git config --global user.name [name]

# 设置 git 邮箱
git config --global user.email [email]

# 设置 git 区分大小写
git config --global core.ignorecase false

# 生成 ssh 密钥
# 执行后需要填写保存路径（直接回车选择默认位置）和密码（直接回车不设置密码）
ssh-keygen -t rsa -b 4096 -C "yourEmail"

# 安装 xclip 命令并复制公钥
# 执行完成后将公钥添加到 Git 托管服务中即可
sudo apt install xclip && cat ~/.ssh/id_rsa.pub | xclip -selection clipboard
```

之后便可以创建你的项目文件，通常直接保存在用户目录下，即 `~/xxx`（`/home/username/xxx`），之后可以在任何位置通过 `cd ~/xxx` 快速切换到工作目录，也可以使用上面添加 `proxy` 命令的方法，添加一个快捷跳转命令：

```shell
# 打开 zsh 配置
code ~/.zshrc

# 在配置中添加
alias xxx="cd ~/xxx"

# 刷新配置
. ~/.zshrc

# 直接使用命令即可跳转到工作目录
xxx
```

## 使用 VSCode 进行开发

WSL 环境中的项目，可以直接在 Windows 中的 VSCode 进行开发，安装 VSCode 后同时安装远程开发扩展包 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)，扩展包中包含多个扩展

安装完成后直接在 WSL 环境中运行 `code path` 命令，或者在 VSCode 中通过快捷键 `Ctrl + Shift + P` 执行 `WSL:连接到WSL` 命令连接到 WSL 环境，即可在 VSCode 中打开项目

VSCode 连接 WSL 环境后开发项目可以直接使用 WSL 环境中的命令行和工具

在 WSL 中也是可以直接访问 Windows 中的文件的，`/mnt` 路径即代表 Windows 环境

## 更多命令

WSL 理论上支持安装运行任意多个不同的 Linux 发行版，比如再安装一个 Debian：

```shell
wsl --install -d Debian
```

安装后可以用 `wsl --list` 来查看已安装的发行版，并通过打开不同的发行版命令行使用不同的环境，当然新的环境需要重新配置

如果需要卸载 WSL 发行版，可以使用 `wsl --unregister <DistributionName>` 命令，卸载后**所有数据/软件/设置都会删除**

更多介绍请查看[官方文档](https://learn.microsoft.com/zh-cn/windows/wsl/)
