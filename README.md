## 介绍

使用ast语法树解析，扫描指定代码中js/ts中不希望出现的关键字（注释除外）。如避免mock地址在代码中被提交

## 安装 

`npm i -D scankey`

## 命令行参数说明

| 参数 | 说明 | 是否必填 
| ---- | ---- | ---- 
| --root | 指定扫描的代码目录或者指定文件 | 是
| --keywords | 需要扫描的关键字，多个时用英文逗号分隔 | 是
| --ext | 扫描文件后缀名，多个时用英文逗号分隔 | 否，默认值.js,.jsx,.ts,.tsx

## 使用

例如：`scankey --root ./src --keywords mock.xxx.com,tokenKey`

可结合husky配置，如：
````json
"husky": {
    "hooks": {
        "pre-commit": "scankey --root ./src --keywords mock.xxx.com"
    }
}
````