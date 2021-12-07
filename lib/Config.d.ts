import type { Config as ConfigType } from './types';
export declare const DEFAULT_CONFIG_PATH: string;
export declare class Config {
    #private;
    static readonly DEFAULT: ConfigType;
    useDefaultValueIfMissing(): void;
    read(path?: string): ConfigType;
    get(): ConfigType;
}
declare const _default: Config;
export default _default;
