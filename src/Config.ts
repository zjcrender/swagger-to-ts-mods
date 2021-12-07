import { readJsonFile } from "./utils/file";
import type { Config as ConfigType } from './types';
import path from "path";
import getNameByHref from "./utils/getNameByHref";

export const DEFAULT_CONFIG_PATH = path.resolve(process.cwd(), 's2t.config.json');

export class Config {
  #config: ConfigType = Config.DEFAULT;

  static readonly DEFAULT: ConfigType = {
    request: {
      filePath: '@/services',
      methodName: 'request',
      default: true,
    },
    handleUnknownType: 'unknown',
    templateDir: path.resolve(__dirname, 'templates'),
    outputDir: path.resolve(process.cwd(), 'services'),
    origins: [],
  }

  public useDefaultValueIfMissing() {
    const {
      request = {},
      origins = [],
      ...rest
    } = this.#config;

    this.#config = {
      ...Config.DEFAULT,
      ...rest,
      request: Object.assign({}, Config.DEFAULT.request, request),
      origins: origins
        .filter(origin => Boolean(origin.origin))
        .map(item => {
          const { request: originRequest = {}, originName, origin } = item;

          return {
            origin,
            originName: originName || getNameByHref(origin),
            request: Object.assign({}, Config.DEFAULT.request, request, originRequest),
          }
        })
    }
  }

  public read(path: string = DEFAULT_CONFIG_PATH) {
    this.#config = readJsonFile<ConfigType>(path);
    this.useDefaultValueIfMissing();
    return this.get();
  }

  public get() {
    return this.#config;
  }

}

export default new Config();