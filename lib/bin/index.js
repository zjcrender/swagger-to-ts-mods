#!/usr/bin/env node
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
const commander_1 = require("commander");
const setup_1 = __importDefault(require("../commands/setup"));
const generate_1 = __importDefault(require("../commands/generate"));
const figlet = require('figlet');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(chalk.green(figlet.textSync('SWAGGER TO TS TYPES')));
        commander_1.program
            .version(require('../../package.json').version)
            .name('s2t')
            .usage('[命令] [配置项]')
            .description('根据swagger文档生成typescript类型声明文件，及api调用函数');
        commander_1.program
            .command('setup')
            .description('生成配置文件')
            .argument('[outputPath]', '配置文件保存地址')
            .action(setup_1.default);
        commander_1.program
            .command('generate')
            .alias('g')
            .description('根据配置文件生成接口类型文件')
            .argument('[configPath]', '配置文件地址')
            .action(generate_1.default);
        yield commander_1.program.parseAsync(process.argv);
        process.exit(0);
    });
}
run().catch(error => {
    console.log(chalk_1.default.red(error));
    process.exit(1);
});
