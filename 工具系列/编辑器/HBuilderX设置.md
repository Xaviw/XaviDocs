# HBuilderX设置

`HBuilderX`在代码格式化方面与`VSCode`相差甚远，但没办法还得继续用。所以配置了一套自用基本顺手的配置，保存在仓库[HBuilderX-Settings](https://github.com/Xaviw/HBuilderX-Settings)中

## 所需插件

- [eslint-js](https://ext.dcloud.net.cn/plugin?id=2037)
- [eslint-plugin-vue](https://ext.dcloud.net.cn/plugin?id=2005)
- [prettier](https://ext.dcloud.net.cn/plugin?id=2025)
- [代码拼写检查器](https://ext.dcloud.net.cn/plugin?name=spell-check)

`HBuilderX`仅支持根据`eslint`插件配置的规则进行自动格式化，无法读取项目中的`eslint`

但是也可以在项目中安装`eslint`、`prettier`相关包通过`scripts`命令的方式更全面的配置格式化

同时`HBuilderX`无法自动同步配置，也无法通过项目中的插件配置文件同步协作规范。所以如果有协助需求的项目更推荐在项目中配置`eslint`、`prettier`规则与相关格式化命令

代码拼写检查器和`VSCode`中的`Code Spell Checker`插件一致，可以在插件设置或源码视图中自行增加忽略词

## 快捷键

快捷键采用`VSCode`风格，修改了保存全部`ctrl+shift+s`与快捷块级注释`ctrl+shift+/`

## extensions

放置在 **`用户目录\AppData\Roaming\HBuilder X\extensions`** 

对应插件配置

## user

放置在 **`用户目录\AppData\Roaming\HBuilder X\user`**

对应快捷键设置与应用设置

