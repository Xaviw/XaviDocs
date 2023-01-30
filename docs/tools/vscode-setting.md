# VSCode设置相关

VSCode是目前前端最常用的编辑器，优点无需多说。这里记录下我使用过程中让VSCode变得更好用的一些理解

## 设置级别

VSCode中的设置分为三级，打开项目后会读取每一级别的设置，小区域级别的设置会覆盖大区域级别的设置

> 项目 > 工作区 > 用户

### 项目级

也就是项目中`.vscode`文件夹下的配置文件，需要手动添加，常用的包括：

```Markdown
- .vscode
  - settings.json 编辑器设置
  - extensions.json 扩展应用推荐
  - launch.json 调试设置
- 根目录
```

extensions.json中添加推荐的扩展ID，工程化项目中git提交后可以提醒团队项目成员安装必要的插件。当打开项目编辑器发现有推荐的插件未安装时，会在编辑器右下角提示安装

格式如下：

```JSON
{
  "recommendations": ["vue.volar"],
  "unwantedRecommendations": [], // 不推荐使用的扩展
}

```

> 扩展ID通过 **右击插件 → 复制扩展ID** 获得

settings.json在下文介绍；launch.json会在运行调试后自动生成，更详细的配置本文不做介绍

### 工作区

通过 **文件 → 将工作区另存为** 即可保存一个扩展名为`.code-workspace`的工作区文件，工作区内可以通过 **文件 → 将文件夹添加到工作区** 添加项目。

一个工作区内可以存在多个项目。例如当手头同时有vue2和vue3的项目时，由于vue2使用vuter，vue3使用volar，每次打开都切换插件很不方便。就可以建立vue2和vue3两个工作区，将同类的项目放至工作区，并针对工作区级别独立设置，这样通过工作区打开项目就无需频繁切换设置

> 工作区的编辑器设置位于 **设置 → 工作区 **中
插件通过 启用/禁用 旁边的下拉箭头中选择 **启用/禁用(工作区)** 实现仅在当前工作区中开启或关闭该插件（直接点击启用/禁用是全局生效的）

### 用户

用户级别设置即全局设置，未登录账号时保存在电脑中，登录账号后会自动进行同步

> 部分教程讲的同步需要通过安装特定插件等复杂操作，但现在只需要在VSCode中登录账号，并打开设置同步就可以了。新环境中登录后会自动同步设置以及安装插件

## 个性化设置

编辑器设置也就是每一级settings.json中的配置，除了项目级别手动添加外，工作区和用户级别均在设置界面中

VSCode提供了可视化和源码配置两种设置方式，进入设置界面默认显示可视化配置，可以通过右上角打开设置图标切换为源码视图

安装Chinese插件后大部分的设置项都有中文说明，除了VSCode自身的设置外，部分插件也会有设置项

设置项非常庞杂，而且部分说明也没法快速清晰的理解具体效果。所以我个人并不推荐手动修改配置，可以参考[Anthony Fu](https://antfu.me/)大佬分享的[配置文件](https://github.com/antfu/vscode-settings)，并**在实际使用中根据自身需求再去了解通过什么配置项修改**

界面样式Theme相关，以及字体设置fontFamily需要已安装对应的样式、字体，样式通过在插件中搜索，字体需要自行下载安装

大佬配置的界面是Mac风格，侧边栏在右边，关闭按钮在选项卡左边，可以自行修改

```JSON
  "workbench.sideBar.location": "left", // 侧边栏位置
  "workbench.editor.tabCloseButton": "right", // tab关闭按钮位置
```

大佬使用的格式化操作是仅使用eslint，所以关闭了prettier，为什么我会在后文介绍

可以根据需求选择全局或项目/工作区级别设置中开启prettier

```JSON
"prettier.enable": false, // 用户级别中注释该句开启prettier，或在特定的设置级别中设置为true
```

其他推荐设置：

```JSON
"editor.linkedEditing": true, // 编辑时自动修改关联的标签，如HTML标签（功能同Auto Rename Tag插件，添加这条配置后这个插件就可以卸载了）
```

设置中可能有灰色的设置项，显示是未知的配置。可能的情况有：

1. 该设置项不存在
2. 仅在其他系统中生效
3. 属于插件设置项，但并未安装该插件

## 快捷键

熟悉常用快捷键能大幅度提升编码速度与体验，常用的操作比如：

- 选择相同单词
- 插入、移动、复制、删除行
- 多光标操作
- 单行、多行注释
- 保存单个、多个文件
- 命令面板

    `ctrl + shift + p`打卡命令面板，通过输入命令的方式执行编辑器或插件提供的操作。例如：

    - reload window：重新加载窗口，编辑器卡住或插件未生效时很有用（重新加载不会停止终端中运行的服务）
    - sort json（sort package.json）：安装这两个插件后可以选中json代码执行命令，即可完成排序
- 切换文件

    `ctrl + p`打开项目文件目录，能够快速打开最近使用的文件或通过缩写定位文件
- ...

可以参考[官方键盘快捷方式参考](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf)（帮助 → 键盘快捷方式参考），或者在 左下角管理 → 键盘快捷方式 中查看或修改常用快捷键

## 代码片段（snippets）

代码片段也就是通过敲几个字母的缩写，生成所需要的模板，例如Emmet语法就是一种代码片段。VSCode内置的还包括`log`生成`console.log()`，`!`生成基本HTML结构等

vetur等插件提供代码片段也是通过这种方式，我们可以根据自己的需求自定义代码片段

通过 **命令面板 → configure user snippets → 新建全局/项目代码片段 → 输入片段名** 即可新建代码片段文件

文件中的注释说明了代码片段的书写格式以及提供了例子：

```JSONC
{
  // 代码片段名字
  "Print to console": {
    // 生效文件类型
    "scope": "javascript,typescript",
    // 触发关键字
    "prefix": "log",
    // 模板内容
    "body": [
      "console.log('$1');",
      "$2"
    ],
    // 描述
    "description": "Log output to console"
  }
}
```

`$n`表示光标占位符，表现形式是可以通过`tab键`在这些占位符中快速切换。`$0`比较特殊是最后定位的位置，`${n:placeholder}`可以为占位符添加描述，还支持多选项形式`${1|one,two,three|}`

body中每一条字符串为一行，支持使用`\n\t`等转义字符，也可以通过[在线工具](https://snippet-generator.app/)快速生成snippets

还有更多的操作，例如使用变量，插入后转换等。不常使用，感兴趣可以参考[官方文档](https://code.visualstudio.com/docs/editor/userdefinedsnippets)

## 实用功能

### NPM脚本

资源管理器栏中的NPM脚本栏，会自动读取项目package.json中配置的命令，可以在这里快速查看命令并执行

![](https://secure2.wostatic.cn/static/x6uPF3YKkniGeY2WsNTqr3/image.png?auth_key=1675061544-hyfFtu8syV9CmDtK3Vk5JB-0-f14b8dd265a658af748a13369165af5f)

### 源代码管理

侧边栏中提供的git工具，安装了gitlens插件还会有查看提交记录等更多操作

实现了git常用操作，而且是中文命令，比手敲更快捷稳定

状态栏左下角会显示当前git分支以及更改数量，点击分支能快速切换分支
