import type { Config, OriginConfig, RequestConfig } from "../types";
import chalk from 'chalk';
import { isFile, isReadable, readJsonFile } from "../utils/file";
import { DEFAULT_CONFIG_PATH } from "../Config";

const inquirer = require('inquirer');
const fs = require('fs');

interface FileCheckReaction {
  reaction?: 'exit' | 'update' | 'rewrite';
}

type BasicConfAns = Pick<Config, 'handleUnknownType' | 'outputDir' | 'templateDir'> & RequestConfig;
type OriginConfAns = Omit<OriginConfig, 'request'> & RequestConfig & { special: boolean; continue: boolean };

export default async function setup(path: string = DEFAULT_CONFIG_PATH) {

  let currentConfig: Config | null = null;
  if (isFile(path) && isReadable(path)) {
    currentConfig = readJsonFile<Config>(path);
  }

  const fileCheckAns = await inquirer.prompt([
    {
      type: 'list',
      name: 'reaction',
      message: '配置文件已存在',
      choices: [
        {
          name: '继续使用现有配置',
          value: 'exit'
        },
        {
          name: '更新现有配置',
          value: 'update'
        },
        new inquirer.Separator(),
        {
          name: '重新生成配置文件',
          value: 'rewrite'
        }
      ],
      when: () => currentConfig !== null,
    },
  ]) as FileCheckReaction;

  let newConfigs: Config;

  switch (fileCheckAns.reaction) {
    case "exit":
      return process.exit(0);
    case "update":
      newConfigs = { ...currentConfig! };
      break;
    case "rewrite":
    default:
      newConfigs = {} as Config;
      break;
  }

  const basicConfAns = await inquirer.prompt([
    {
      name: 'filePath',
      message: '请求文件路径',
      default: newConfigs.request?.filePath ?? '@/services',
    },
    {
      name: 'methodName',
      message: '请求函数名称',
      default: newConfigs.request?.methodName ??  'request',
    },
    {
      type: 'list',
      name: 'default',
      message: '请求函数导出方式',
      choices: [
        { name: '默认导出(export default)', value: true },
        { name: '命名导出(export const)', value: false },
      ]
    },
    {
      type: 'list',
      name: 'handleUnknownType',
      message: '如何处理未知类型',
      choices: [
        { name: 'unknown', value: 'unknown' },
        { name: 'generic', value: 'generic' },
        { name: 'any', value: 'any' },
      ]
    },
    {
      name: 'outputDir',
      message: '配置文件输出路径',
      default: newConfigs?.outputDir ?? './services',
    },
    {
      name: 'templateDir',
      message: '模板文件路径',
      default: newConfigs?.templateDir,
    },
  ]) as BasicConfAns;

  newConfigs.request = {
    filePath: basicConfAns.filePath,
    methodName: basicConfAns.methodName,
    default: basicConfAns.default,
  }
  newConfigs.handleUnknownType = basicConfAns.handleUnknownType;
  newConfigs.outputDir = basicConfAns.outputDir;
  basicConfAns.templateDir && (newConfigs.templateDir = basicConfAns.templateDir);

  let addOrigin = true;
  newConfigs.origins = newConfigs.origins || [];
  while (addOrigin) {
    const originConfAns = await inquirer.prompt([
      {
        name: 'originName',
        message: 'Swagger文档名称',
        validate(input: string) {
          if (!input) return '请输入文档名！'
          return true;
        }
      },
      {
        name: 'origin',
        message: 'Swagger文档地址',
        validate(input: string) {
          if (!/^http/.test(input)) return '请输入正确的文档地址'
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'special',
        message: '是否为该源指定特殊请求函数？',
      },
      {
        name: 'filePath',
        message: '请求文件路径',
        default: '@/services',
        when: (ans: OriginConfAns) => ans.special,
      },
      {
        name: 'methodName',
        message: '请求函数名称',
        default: 'request',
        when: (ans: OriginConfAns) => ans.special,
      },
      {
        type: 'list',
        name: 'default',
        message: '请求函数导出方式',
        choices: [
          { name: '默认导出(export default)', value: true },
          { name: '命名导出(export const)', value: false },
        ],
        when: (ans: OriginConfAns) => ans.special,
      },

      {
        type: 'confirm',
        name: 'continue',
        message: '是否继续添加？',
      }
    ]) as OriginConfAns;

    const newOrigin: OriginConfig = {
      origin: originConfAns.origin,
      originName: originConfAns.originName,
    }
    if (originConfAns.special) {
      newOrigin.request = {
        filePath: originConfAns.filePath,
        methodName: originConfAns.methodName,
        default: originConfAns.default
      }
    }

    let prevOrigin = newConfigs.origins?.find(origin => origin.originName === newOrigin.originName);
    if (prevOrigin) {
      Object.assign(prevOrigin, newOrigin);
    } else {
      newConfigs.origins.push(newOrigin);
    }

    addOrigin = originConfAns.continue;
  }

  fs.writeFileSync(path, JSON.stringify(newConfigs, undefined, 2));

  console.log(chalk.green('✨ 已成功生成配置文件'));
  console.log(chalk.green('📖更多配置请参阅文档 https://github.com/zjcrender/swagger-to-ts-mods'));
}