# 欢迎使用 swagger-to-ts-mods 👋

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](doc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

中文文档 | [English](./README-en.MD)

`swagger-to-ts-mods` 根据 [swagger文档](https://swagger.io/specification/v2/)生成typescript类型声明及api调用函数

## 安装

```shell
# 使用 npm
npm install swagger-to-ts-mods

# 使用 yarn
yarn add swagger-to-ts-mods
```

## 使用

```shell
# 生成配置文件
$ s2t setup

# 生成类型声明及api函数
$ s2t generate

# 查看说明
$ s2t [command] -h
```

## 生成示例

### API.d.ts

```typescript
declare namespace API {
  namespace User {
    interface Exception {
      cause?: Throwable;
      localizedMessage?: string;
      message?: string;
      stackTrace?: StackTraceElement[];
      suppressed?: Throwable[];
    }
    interface RestVo {
      code?: number;
      data?: { ... };
      exception?: Exception;
      message?: string;
    }
    /** login */
    namespace postAuthsLogin {
      type Query = {
        /** checkcode */
        code?: string;
        /** phone */
        mobile?: string;
        /** password */
        password?: string;
        /** account */
        username?: string;
      };

      type Response = RestVo;
    }
  }
  
  namespace File { ... }
  ...
}
```

### some-operation.ts

e.g. `postAuthsLogin.ts`

```typescript
import uRequest from "@/services";

import Inter = API.User.postAuthsLogin;

/** login */
export function postAuthsLogin(query: Inter.Query): Promise<Inter.Response> {
  return uRequest<Inter.Response>("/api/v1/auths/login", {
    method: "post",
    params: query,
  });
}
```



## 命令

### `$ s2t setup [outputPath]`

生成配置文件

| 参数   | 默认值                 |是否必填| 说明         |
|------|---------------------|---|------------|
| outputPath | "./s2t.config.json" |否| 指定配置文件输出地址 |

### `$ s2t generate [configPath]`
根据配置文件生成目标文件

| 参数   | 默认值                 |是否必填| 说明         |
|------|---------------------|---|------------|
| configPath | "./s2t.config.json" |否| 用于指定配置文件地址 |

## 配置文件

### s2t.config.json

| key     | 类型            | 默认值             | 是否必填  | 说明       |
|:--------|:--------------|:----------------|-------|:---------|
| request | [RequestConfig](#RequestConfig) | 见[RequestConfig](#RequestConfig) | 是     | 通用api请求设置 |
| handleUnknownType  | unknown  \|  generic \| any | unknown | 否 | 如何处理未知类型 （暂未实现） |
| outputDir | Path | "./services" | 否 | 生成文件的目录 |
| templateDir | Path | [内置](./src/templates) | 否 | 生成类型声明及api函数时的模板文件目录 |
| origins  | [OriginConfig](#OriginConfig)[] | 无    | 是 | 指定swagger文档地址来源 |



### OriginConfig

| key        | 类型                           | 默认值                            | 是否必填 | 说明                     |
| :--------- | :----------------------------- | :-------------------------------- | -------- | :----------------------- |
| origin     | string                         | 无                                | 是       | swagger文档地址          |
| originName | string                         | 无                                | 是       | 指定该文档名称           |
| request    | [RequestConfig](RequestConfig) | 见[RequestConfig](#RequestConfig) | 否       | 为该文档指定特殊请求设置 |



### RequestConfig

生成api函数时指定基类函数的引入方式

如： `import ${methodName} from "${filePath}"`

| key        | 类型    | 默认值      | 是否必填 | 说明                 |
| :--------- | :------ | :---------- | -------- | :------------------- |
| filePath   | Path    | "@/request" | 否       | 指定本地接口调用函数 |
| methodName | string  | request     | 否       | 指定导出的函数名     |
| default    | boolean | true        | 否       | 方法是否为默认导出   |



### 模板文件

使用[mustache](https://github.com/mustache/mustache.github.com)作为渲染引擎

| 模板               | 内容                                       | 说明         |
| :----------------- | :----------------------------------------- | :----------- |
| API.d.mustache     | [内置](./src/templates/API.d.mustache)     | 声明文件模板 |
| operation.mustache | [内置](./src/templates/operation.mustache) | api模板      |



## TODOS:

- [ ] 支持$ref中远程文档的解析
- [ ] 处理未知类型时，支持泛型
