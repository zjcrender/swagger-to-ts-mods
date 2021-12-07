import type { Config } from "../types";

import chalk from 'chalk';
import { readJsonFile } from "../utils/file";

const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');

const CONFIG_FILE_NAME: string = 's2t.config.json';
const CONFIG_FILE_PATH: string = path.resolve(process.cwd(), CONFIG_FILE_NAME);

enum FILE_REACTION {
  EXIT,
  UPDATE,
  REBUILD
}

interface FileCheckReaction {
  reaction?: FILE_REACTION;
}

const currentConfig = readJsonFile<Config>(CONFIG_FILE_PATH);

export default async function setup(path: string = '') {
  const fileCheckAns = await inquirer.prompt([
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
  ]) as FileCheckReaction;

  let newConfigs: Config;

  switch (fileCheckAns?.reaction) {
    case FILE_REACTION.EXIT:
      return process.exit(0);
    case FILE_REACTION.UPDATE:
      newConfigs = { ...currentConfig! };
      break;
    case FILE_REACTION.REBUILD:
    default:
      newConfigs = {} as Config;
      break;
  }

  const configAns = await inquirer.prompt([]) as Config;

  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(Object.assign(newConfigs, configAns), undefined, 2));

  console.log(chalk.green('✨ 已成功生成配置文件'));
  console.log(chalk.green('📖更多配置请参阅文档 https://xxxx.com'));
}