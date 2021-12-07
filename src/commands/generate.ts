import type { Config, OriginConfig, ParserResult } from "../types";
import Parser from "../Parser";
import asyncQueue from "../utils/asyncQueue";
import confIns, { DEFAULT_CONFIG_PATH } from '../Config';
import { CodeGenerator } from "../CodeGenerator";


export default async function generate(configPath: string = DEFAULT_CONFIG_PATH) {

  const config = confIns.read(configPath);

  const parserRunners = config.origins.map(origin => () => new Parser(origin).parse());
  const parserQueue = asyncQueue(parserRunners);

  const resultsMap: Record<string, ParserResult> = {};
  for await (const result of parserQueue) {
    resultsMap[result.name] = result;
  };

  new CodeGenerator(resultsMap).make();

}