"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Config_config;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.DEFAULT_CONFIG_PATH = void 0;
const file_1 = require("./utils/file");
const path_1 = __importDefault(require("path"));
const getNameByHref_1 = __importDefault(require("./utils/getNameByHref"));
exports.DEFAULT_CONFIG_PATH = path_1.default.resolve(process.cwd(), 's2t.config.json');
class Config {
    constructor() {
        _Config_config.set(this, Config.DEFAULT);
    }
    useDefaultValueIfMissing() {
        const _a = __classPrivateFieldGet(this, _Config_config, "f"), { request = {}, origins = [] } = _a, rest = __rest(_a, ["request", "origins"]);
        __classPrivateFieldSet(this, _Config_config, Object.assign(Object.assign(Object.assign({}, Config.DEFAULT), rest), { request: Object.assign({}, Config.DEFAULT.request, request), origins: origins
                .filter(origin => Boolean(origin.origin))
                .map(item => {
                const { request: originRequest = {}, originName, origin } = item;
                return {
                    origin,
                    originName: originName || (0, getNameByHref_1.default)(origin),
                    request: Object.assign({}, Config.DEFAULT.request, request, originRequest),
                };
            }) }), "f");
    }
    read(path = exports.DEFAULT_CONFIG_PATH) {
        __classPrivateFieldSet(this, _Config_config, (0, file_1.readJsonFile)(path), "f");
        this.useDefaultValueIfMissing();
        return this.get();
    }
    get() {
        return __classPrivateFieldGet(this, _Config_config, "f");
    }
}
exports.Config = Config;
_Config_config = new WeakMap();
Config.DEFAULT = {
    request: {
        filePath: '@/services',
        methodName: 'request',
        default: true,
    },
    handleUnknownType: 'unknown',
    templateDir: path_1.default.resolve(__dirname, 'templates'),
    outputDir: path_1.default.resolve(process.cwd(), 'services'),
    origins: [],
};
exports.default = new Config();
