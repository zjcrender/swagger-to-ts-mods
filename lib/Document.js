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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Document_docs, _Document_originNameMap, _Document_local;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const swagger_parser_1 = __importDefault(require("@apidevtools/swagger-parser"));
const getNameByHref_1 = __importDefault(require("./utils/getNameByHref"));
/**
 * 只做两件事
 * 1. 下载并保存文档，方便按名称索引
 * 2. 未指定文档名时根据路径生成一个名称
 * */
class Document {
    constructor() {
        _Document_docs.set(this, new Map());
        _Document_originNameMap.set(this, new Map());
        _Document_local.set(this, new Set());
    }
    getNameByHref(href) {
        if (__classPrivateFieldGet(this, _Document_originNameMap, "f").has(href))
            return __classPrivateFieldGet(this, _Document_originNameMap, "f").get(href);
        const name = (0, getNameByHref_1.default)(href);
        __classPrivateFieldGet(this, _Document_originNameMap, "f").set(href, name);
        return name;
    }
    add(originConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const { origin, originName = this.getNameByHref(origin), } = originConfig;
            if (__classPrivateFieldGet(this, _Document_docs, "f").has(originName))
                return __classPrivateFieldGet(this, _Document_docs, "f").get(originName);
            console.log(`[INFO]: 获取文档 ${origin}`);
            const doc = yield this.fetch(originConfig.origin);
            doc.definitions = doc.definitions || {};
            // 指定名称时不再通过getNameByHref生成
            __classPrivateFieldGet(this, _Document_originNameMap, "f").set(origin, originName);
            __classPrivateFieldGet(this, _Document_docs, "f").set(originName, doc);
            return doc;
        });
    }
    get(docName) {
        return __classPrivateFieldGet(this, _Document_docs, "f").get(docName);
    }
    getByHref(href) {
        return this.get(this.getNameByHref(href));
    }
    fetch(origin) {
        return swagger_parser_1.default.parse(origin);
    }
}
exports.Document = Document;
_Document_docs = new WeakMap(), _Document_originNameMap = new WeakMap(), _Document_local = new WeakMap();
exports.default = new Document();
