"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _CodeGenerator_parserResults, _CodeGenerator_templateData;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenerator = void 0;
const Config_1 = __importDefault(require("./Config"));
const file_1 = require("./utils/file");
const path_1 = __importDefault(require("path"));
const mustache_1 = __importDefault(require("mustache"));
const prettier_1 = __importDefault(require("prettier"));
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
class CodeGenerator {
    constructor(parserResults) {
        _CodeGenerator_parserResults.set(this, {});
        _CodeGenerator_templateData.set(this, { origins: [] });
        __classPrivateFieldSet(this, _CodeGenerator_parserResults, parserResults, "f");
    }
    makeComment(text) {
        if (!text)
            return '';
        let commentText = text.trim().replace(/\*\//g, "*\\/");
        // 单行
        if (commentText.indexOf("\n") === -1) {
            return `\/** ${commentText} *\/\n`;
        }
        // 多行
        commentText = ' * ' + commentText;
        let lines = [
            '\/**',
            ...commentText.replace(/\r?\n/g, " * \n").split('\n'),
            ' * *\/'
        ];
        return lines.join('');
    }
    makePropertyTypes(props) {
        // TODO: 处理无property时的类型
        if (props.length === 0)
            return '{ [props: string]: unknown }';
        let output = '{\n';
        props.forEach(prop => {
            const { name, required, description, type } = prop;
            const requiredFlag = required ? '' : '?';
            output += `${this.makeComment(description)}${name}${requiredFlag}: ${this.makeModalType(type)}\n`;
        });
        output += '}';
        return output;
    }
    makeModalType(modal) {
        let output;
        switch (modal.modalType) {
            case "typeAliases": {
                const { name, description, type } = modal;
                output = `${this.makeComment(description)}type ${name} = ${this.makeModalType(type)}`;
                break;
            }
            case "interface": {
                const { name, description, properties } = modal;
                output = `${this.makeComment(description)}interface ${name} ${this.makePropertyTypes(properties)}`;
                break;
            }
            case "object": {
                output = `${this.makePropertyTypes(modal.properties)}`;
                break;
            }
            case "ref":
            case "specific":
            case "primitives": {
                output = modal.type;
                break;
            }
            case "unknown": {
                // TODO: handle with config.handleUnknown
                output = modal.type;
                break;
            }
            case "array": {
                output = `${this.makeModalType(modal.type)}[]`;
                break;
            }
            case "tuple": {
                output = `${modal.items.map(this.makeModalType)}`;
                break;
            }
            case "union": {
                output = `(${modal.items.map(this.makeModalType).join('|')})`;
                break;
            }
            case "intersection": {
                output = `(${modal.items.map(this.makeModalType).join('&')})`;
                break;
            }
            default: {
                const unhandledModal = modal;
                console.error('未知类型:', `${unhandledModal}`);
                process.exit(-1);
            }
        }
        return output;
    }
    transform() {
        const tplData = { origins: [] };
        const mappedOrigins = {};
        for (const origin of Config_1.default.get().origins) {
            mappedOrigins[origin.originName] = origin;
        }
        for (const [originName, parserResult] of Object.entries(__classPrivateFieldGet(this, _CodeGenerator_parserResults, "f"))) {
            const definitionsData = [];
            for (const [modalName, modal] of Object.entries(parserResult.definitions)) {
                definitionsData.push({
                    name: modalName,
                    interface: this.makeModalType(modal),
                });
            }
            const endpointsData = [];
            for (const [operationName, operation] of Object.entries(parserResult.endpoints)) {
                const data = {
                    name: operationName,
                    id: operation.id,
                    operation: operation.operation,
                    fullPath: operation.fullPath,
                    description: this.makeComment(operation.summary),
                    response: this.makeModalType(operation.response)
                };
                for (const [paramIn, paramModal] of Object.entries(operation.parameters)) {
                    data[paramIn] = this.makeModalType(paramModal);
                }
                endpointsData.push(data);
            }
            tplData.origins.push({
                name: originName,
                request: mappedOrigins[originName].request,
                definitions: definitionsData,
                endpoints: endpointsData,
            });
        }
        __classPrivateFieldSet(this, _CodeGenerator_templateData, tplData, "f");
    }
    makeDeclaration() {
        const { templateDir, outputDir } = Config_1.default.get();
        const tpl = (0, file_1.readFile)(path_1.default.resolve(templateDir, 'API.d.mustache'));
        const content = mustache_1.default.render(tpl, __classPrivateFieldGet(this, _CodeGenerator_templateData, "f"));
        const result = prettier_1.default.format(content, { parser: "typescript", });
        fs_1.default.mkdirSync(path_1.default.resolve(outputDir), { recursive: true });
        (0, file_1.writeFile)(path_1.default.resolve(outputDir, 'API.d.ts'), result);
        console.log('[INFO]: 类型文件生成成功');
    }
    makeEndpoints() {
        const { templateDir, outputDir } = Config_1.default.get();
        const tpl = (0, file_1.readFile)(path_1.default.resolve(templateDir, 'operation.mustache'));
        __classPrivateFieldGet(this, _CodeGenerator_templateData, "f").origins.forEach(origin => {
            const { name, endpoints, request } = origin;
            fs_1.default.mkdirSync(path_1.default.resolve(outputDir, name), { recursive: true });
            endpoints.forEach(endpoint => {
                const filePath = path_1.default.resolve(outputDir, name, `${endpoint.name}.ts`);
                const content = mustache_1.default.render(tpl, Object.assign(Object.assign({ originName: name }, request), endpoint));
                const result = prettier_1.default.format(content, { parser: "typescript", });
                (0, file_1.writeFile)(filePath, result);
                console.log(`[INFO]: 模块 [${chalk_1.default.blue(name)}] 已生成函数：${chalk_1.default.green(endpoint.name)}`);
            });
        });
    }
    make() {
        this.transform();
        this.makeDeclaration();
        this.makeEndpoints();
    }
}
exports.CodeGenerator = CodeGenerator;
_CodeGenerator_parserResults = new WeakMap(), _CodeGenerator_templateData = new WeakMap();
