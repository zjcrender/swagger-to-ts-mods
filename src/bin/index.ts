import * as path from "node:path";
import * as process from "node:process";
import cac from 'cac';
import { setup, generate } from '../command';

const cli = cac('o2t');

cli
  .version(require('../../package.json').version)
  .usage('[command] [options]')
  .example('o2t setup -o ./o2t.json')
  .example('o2t generate -c ./o2t.json');

cli
  .command('setup', 'Setup openapi-to-typescript')
  .option(
    '-o, --output [output]',
    'Output path',
    { default: path.join(process.cwd(), 'o2t.json') }
  )
  .action(setup);

cli
  .command('generate', 'Generate types and api files')
  .alias('g')
  .usage('generate|g')
  .example('o2t g -c /path/to/configFile.json')
  .option(
    '-c, --config [config]',
    'config file path',
    { default: path.join(process.cwd(), 'o2t.json') }
  )
  .action(generate);

cli
  .help()
  .parse()
