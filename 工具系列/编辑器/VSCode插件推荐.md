# VSCode 插件推荐

## 简体中文

名称: Chinese (Simplified) (简体中文) Language Pack for Visual Studio Code

ID: MS-CEINTL.vscode-language-pack-zh-hans

## 拼写检查

名称: Code Spell Checker

ID: streetsidesoftware.code-spell-checker

检查单词拼写，错误的拼写会有下划线提示

可以在对应单词的快速修复中选择 `Add: "xxx" to workspace/user settings`，将这个单词添加对应级别设置中，后续该级别下文件不会再提示该单词错误（添加至项目级别方便 git 同步给团队成员共用）

## 编辑器配置 Editorconfig

名称: EditorConfig for VS Code

ID: EditorConfig.EditorConfig

editorconfig 插件，安装后会识别项目中的`.editorconfig`配置，用于覆盖编辑器配置，详见[官方文档](https://editorconfig.org/)

## 增强异常信息显示

名称: Error Lens

ID: usernamehw.errorlens

<Image src="/VSCode插件推荐-1.png" alt="errorlens效果" />

可以设置显示级别，和排除部分类型异常

```JSON
"errorLens.enabledDiagnosticLevels": ["warning", "error"], // 仅增强显示警告和错误
"errorLens.excludeBySource": ["cSpell", "Grammarly", "eslint"], // 排除拼写、语法异常
```

## 增强注释显示以及索引

名称: Todo Tree

ID: Gruntfuggly.todo-tree

注释中写对应标签时会突出显示，并在左侧 todoTree 插件栏中添加索引。可以自行设置标签关键字以及颜色

<Image src="/VSCode插件推荐-2.png" alt="todo-tree效果" />

## 编码时长统计

名称: WakaTime

ID: WakaTime.vscode-wakatime

记录编辑器使用时间等信息，可以生成开发统计数据。需要注册账号

## 修改界面图标

名称: Carbon Product Icons

ID: antfu.icons-carbon

## 修改文件图标

名称: file-icons

ID: file-icons.file-icons

## 增强 git 能力

名称: Git History

ID: donjayamanne.githistory

<hr />

名称: GitLens — Git supercharged

ID: eamodio.gitlens

## 语法检查+格式化

名称: ESLint

ID: dbaeumer.vscode-eslint

<hr />

名称: Prettier - Code formatter

ID: esbenp.prettier-vscode

## 国际化辅助插件

名称: i18n Ally

ID: lokalise.i18n-ally

## iconify 标签直接显示为对应图标

名称: Iconify IntelliSense

ID: antfu.iconify

## JSON 排序

名称: Sort JSON objects

ID: richie5um2.vscode-sort-json

<hr />

名称: Sort package.json

ID: unional.vscode-sort-package-json

排序 json 与排序 package.json，package.json 有自己推荐的顺序

通过`ctrl + shift + p`调出命令窗口并输入命令执行

## 其他

Vuter、Volar、Less、Sass、Stylelint、PostCss Language Support 等根据需要，大多数需求都有对应的插件

但不要随意安装插件，插件会占用较多的内存。另外部分插件有重复的功能，互相影响会出现一些意想不到的情况

部分插件功能 VSCode 已内置，可以参考[这篇文章](https://juejin.cn/post/6844904115798016008)排查是否可以卸载某些插件
