# Welcome to swagger-to-ts-mods 👋

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](doc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

[中文文档](./README.MD) | English

`swagger-to-ts-mods` parse [swagger document](https://swagger.io/specification/v2/) into typescript definitions and api methods

## Install

```shell
# with npm
npm install swagger-to-ts-mods

# with yarn
yarn add swagger-to-ts-mods
```

## Usage

```shell
# generate config file
$ s2t setup

# generate dist files
$ s2t generate

# help
$ s2t [command] -h
```

## Example

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



## Command

### `$ s2t setup [outputPath]`

generate config file

| arg        | default             | required | description             |
| ---------- | ------------------- | -------- | ----------------------- |
| outputPath | "./s2t.config.json" | false    | config file output path |

### `$ s2t generate [configPath]`
generate dist files with config file

| arg        | default             | required | description      |
|------------|---------------------|----------|------------------|
| configPath | "./s2t.config.json" | false    | config file path |

## Config file

### s2t.config.json

| key     | type                            | default                          | required |  description         |
|:--------|:--------------------------------|:---------------------------------|----------|:---------------------|
| request | [RequestConfig](#RequestConfig) | see [RequestConfig](#RequestConfig) | true | api request method |
| handleUnknownType  | unknown  \| generic \| any       | unknown                | false | deal with unknown types (NOT READY) |
| outputDir | Path                            | "./services"                     | false   | output files dir |
| templateDir | Path                            | [built-in](./src/templates)    | false   | template files dir |
| origins  | [OriginConfig](#OriginConfig)[] | --                          | true | swagger document config |



### OriginConfig

| key        | Type                           | default                             | required | description               |
| :--------- | :----------------------------- | :---------------------------------- | -------- | :------------------------ |
| origin     | string                         | --                                  | true     | swagger document url      |
| originName | string                         | --                                  | true     | swagger document name     |
| request    | [RequestConfig](RequestConfig) | see [RequestConfig](#RequestConfig) | false    | document request settings |



### RequestConfig

| key        | type    | default     | required | description                    |
| :--------- | :------ | :---------- | -------- | :----------------------------- |
| filePath   | Path    | "@/request" | false    | basic api method file path     |
| methodName | string  | request     | false    | name                           |
| default    | boolean | true        | false    | export default or export const |



### Templates

use [mustache](https://github.com/mustache/mustache.github.com) a logic-less templates.

| Template           | content                                        | description          |
| :----------------- | :--------------------------------------------- | :------------------- |
| API.d.mustache     | [built-in](./src/templates/API.d.mustache)     | declaration template |
| operation.mustache | [built-in](./src/templates/operation.mustache) | operation template   |



## TODOS:

- [ ] Derefrence remote $ref
- [ ] Support generic

