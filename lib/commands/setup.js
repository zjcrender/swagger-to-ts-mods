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
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const CONFIG_FILE_NAME = 's2t.config.json';
const CONFIG_FILE_PATH = path.resolve(process.cwd(), CONFIG_FILE_NAME);
var FILE_REACTION;
(function (FILE_REACTION) {
    FILE_REACTION[FILE_REACTION["EXIT"] = 0] = "EXIT";
    FILE_REACTION[FILE_REACTION["UPDATE"] = 1] = "UPDATE";
    FILE_REACTION[FILE_REACTION["REBUILD"] = 2] = "REBUILD";
})(FILE_REACTION || (FILE_REACTION = {}));
const currentConfig = (0, file_1.readJsonFile)(CONFIG_FILE_PATH);
function setup(path = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const fileCheckAns = yield inquirer.prompt([
            {
                type: 'list',
                name: 'reaction',
                message: '检测到配置文件已存在',
                choices: [
                    {
                        name: '继续使用现有配置',
                        value: FILE_REACTION.EXIT
                    },
                    {
                        name: '更新现有配置',
                        value: FILE_REACTION.UPDATE
                    },
                    new inquirer.Separator(),
                    {
                        name: '重新生成配置文件',
                        value: FILE_REACTION.REBUILD
                    }
                ],
                when: () => currentConfig !== null,
            },
        ]);
        let newConfigs;
        switch (fileCheckAns === null || fileCheckAns === void 0 ? void 0 : fileCheckAns.reaction) {
            case FILE_REACTION.EXIT:
                return process.exit(0);
            case FILE_REACTION.UPDATE:
                newConfigs = Object.assign({}, currentConfig);
                break;
            case FILE_REACTION.REBUILD:
            default:
                newConfigs = {};
                break;
        }
        const configAns = yield inquirer.prompt([]);
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(Object.assign(newConfigs, configAns), undefined, 2));
        console.log(chalk_1.default.green('✨ 已成功生成配置文件'));
        console.log(chalk_1.default.green('📖更多配置请参阅文档 https://xxxx.com'));
    });
}
exports.default = setup;
