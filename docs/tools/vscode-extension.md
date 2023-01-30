# VSCode插件推荐

## MS-CEINTL.vscode-language-pack-zh-hans

切换为中文

## streetsidesoftware.code-spell-checker

检查单词拼写，错误的拼写会有下划线提示

可以在对应单词的快速修复中选择 `Add: "xxx" to workspace/user settings`，将这个单词添加对应级别设置中，后续该级别下文件不会再提示该单词错误（添加至项目级别方便git同步给团队成员共用）

## EditorConfig.EditorConfig

editorconfig插件，安装后会识别项目中的`.editorconfig`配置，用于覆盖编辑器配置，详见[官方文档](https://editorconfig.org/)

## usernamehw.errorlens

增强异常信息显示

![](https://secure2.wostatic.cn/static/x6tqmp9WNkK5NtMxesQpDC/image.png?auth_key=1675062356-ugy2qYQ6eVBuLk5PDA4S7V-0-2dfe436673030c17332a7cad7997d1f6)

可以设置显示级别，和排除部分类型异常

```JSON
"errorLens.enabledDiagnosticLevels": ["warning", "error"], // 仅增强显示警告和错误
"errorLens.excludeBySource": ["cSpell", "Grammarly", "eslint"], // 排除拼写、语法异常
```

## Gruntfuggly.todo-tree

注释中写对应标签时会突出显示，并在左侧todoTree插件栏中添加索引。可以自行设置标签关键字以及颜色

![](https://secure2.wostatic.cn/static/eS9ZNjX1FcSVrM5HTzDAgy/image.png?auth_key=1675062356-jPajfpb1KkvyAihwLM4RG1-0-a6441f188d4f232494051eeee19369bc)



## WakaTime.vscode-wakatime

记录编辑器使用时间等信息，可以生成开发统计数据。需要注册账号

## antfu.icons-carbon

修改VSCode界面图标

## file-icons.file-icons

修改不同类型文件显示图标

## donjayamanne.githistory

## eamodio.gitlens

## eamodio.gitlens

上面三个均为添加git辅助功能

## dbaeumer.vscode-eslint

## esbenp.prettier-vscode

eslint+prettier，语法检查+格式化

## lokalise.i18n-ally

国际化插件

## antfu.iconify

iconify标签直接显示为对应图标

## richie5um2.vscode-sort-json

## unional.vscode-sort-package-json

排序json与排序package.json，package.json有自己推荐的顺序

通过`ctrl + shift + p`调出命令窗口并输入命令执行

## 其他Vetur、Volar、Less、Sass等根据需要，大多数需求都有对应的插件
