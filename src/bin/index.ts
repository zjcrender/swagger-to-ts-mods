#!/usr/bin/env node

import chalk from 'chalk';
import { program } from 'commander';
import setup from '../commands/setup';
import generate from "../commands/generate";

const figlet = require('figlet');

async function run() {
  // console.log(chalk.green(figlet.textSync('SWAGGER TO TS TYPES')));

  program
    .version(require('../../package.json').version)
    .name('s2t')
    .usage('[命令] [配置项]')
    .description('根据swagger文档生成typescript类型声明文件，及api调用函数')

  program
    .command('setup')
    .description('生成配置文件')
    .argument('[outputPath]', '配置文件保存地址')
    .action(setup);

  program
    .command('generate')
    .alias('g')
    .description('根据配置文件生成接口类型文件')
    .argument('[configPath]', '配置文件地址')
    .action(generate);

  await program.parseAsync(process.argv);

  process.exit(0);
}

run().catch(error => {
  console.log(chalk.red(error));
  process.exit(1);
})
