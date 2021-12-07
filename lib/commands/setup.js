"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const file_1 = require("../utils/file");
const Config_1 = require("../Config");
const inquirer = require('inquirer');
const fs = require('fs');
function setup(path = Config_1.DEFAULT_CONFIG_PATH) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        let currentConfig = null;
        if ((0, file_1.isFile)(path) && (0, file_1.isReadable)(path)) {
            currentConfig = (0, file_1.readJsonFile)(path);
        }
        const fileCheckAns = yield inquirer.prompt([
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
        ]);
        let newConfigs;
        switch (fileCheckAns.reaction) {
            case "exit":
                return process.exit(0);
            case "update":
                newConfigs = Object.assign({}, currentConfig);
                break;
            case "rewrite":
            default:
                newConfigs = {};
                break;
        }
        const basicConfAns = yield inquirer.prompt([
            {
                name: 'filePath',
                message: '请求文件路径',
                default: (_b = (_a = newConfigs.request) === null || _a === void 0 ? void 0 : _a.filePath) !== null && _b !== void 0 ? _b : '@/services',
            },
            {
                name: 'methodName',
                message: '请求函数名称',
                default: (_d = (_c = newConfigs.request) === null || _c === void 0 ? void 0 : _c.methodName) !== null && _d !== void 0 ? _d : 'request',
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
                default: (_e = newConfigs === null || newConfigs === void 0 ? void 0 : newConfigs.outputDir) !== null && _e !== void 0 ? _e : './services',
            },
            {
                name: 'templateDir',
                message: '模板文件路径',
                default: newConfigs === null || newConfigs === void 0 ? void 0 : newConfigs.templateDir,
            },
        ]);
        newConfigs.request = {
            filePath: basicConfAns.filePath,
            methodName: basicConfAns.methodName,
            default: basicConfAns.default,
        };
        newConfigs.handleUnknownType = basicConfAns.handleUnknownType;
        newConfigs.outputDir = basicConfAns.outputDir;
        basicConfAns.templateDir && (newConfigs.templateDir = basicConfAns.templateDir);
        let addOrigin = true;
        newConfigs.origins = newConfigs.origins || [];
        while (addOrigin) {
            const originConfAns = yield inquirer.prompt([
                {
                    name: 'originName',
                    message: 'Swagger文档名称',
                    validate(input) {
                        if (!input)
                            return '请输入文档名！';
                        return true;
                    }
                },
                {
                    name: 'origin',
                    message: 'Swagger文档地址',
                    validate(input) {
                        if (!/^http/.test(input))
                            return '请输入正确的文档地址';
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
                    when: (ans) => ans.special,
                },
                {
                    name: 'methodName',
                    message: '请求函数名称',
                    default: 'request',
                    when: (ans) => ans.special,
                },
                {
                    type: 'list',
                    name: 'default',
                    message: '请求函数导出方式',
                    choices: [
                        { name: '默认导出(export default)', value: true },
                        { name: '命名导出(export const)', value: false },
                    ],
                    when: (ans) => ans.special,
                },
                {
                    type: 'confirm',
                    name: 'continue',
                    message: '是否继续添加？',
                }
            ]);
            const newOrigin = {
                origin: originConfAns.origin,
                originName: originConfAns.originName,
            };
            if (originConfAns.special) {
                newOrigin.request = {
                    filePath: originConfAns.filePath,
                    methodName: originConfAns.methodName,
                    default: originConfAns.default
                };
            }
            let prevOrigin = (_f = newConfigs.origins) === null || _f === void 0 ? void 0 : _f.find(origin => origin.originName === newOrigin.originName);
            if (prevOrigin) {
                Object.assign(prevOrigin, newOrigin);
            }
            else {
                newConfigs.origins.push(newOrigin);
            }
            addOrigin = originConfAns.continue;
        }
        fs.writeFileSync(path, JSON.stringify(newConfigs, undefined, 2));
        console.log(chalk_1.default.green('✨ 已成功生成配置文件'));
        console.log(chalk_1.default.green('📖更多配置请参阅文档 https://github.com/zjcrender/swagger-to-ts-mods'));
    });
}
exports.default = setup;
