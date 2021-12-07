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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Parser_doc, _Parser_results;
Object.defineProperty(exports, "__esModule", { value: true });
const Document_1 = __importDefault(require("./Document"));
const nodeType_1 = require("./utils/nodeType");
const assertion_1 = require("./utils/assertion");
const path_1 = require("./utils/path");
const ref_1 = require("./utils/ref");
const getValueByPath_1 = __importDefault(require("./utils/getValueByPath"));
const upperCaseFirstChar_1 = __importDefault(require("./utils/upperCaseFirstChar"));
class Parser {
    constructor(config) {
        this.config = config;
        _Parser_doc.set(this, void 0);
        _Parser_results.set(this, { name: 'unset', definitions: {}, endpoints: {} });
        __classPrivateFieldGet(this, _Parser_results, "f").name = config.originName;
        Parser.parsers.push(this);
    }
    parseRef(ref) {
        const [remote, path] = ref.split('#');
        const paths = path.split('/').filter(Boolean).map(ref_1.decodeRef);
        return { remote, paths };
    }
    getRefValue(ref) {
        if (!ref.includes('#'))
            return null;
        const { remote, paths } = this.parseRef(ref);
        const doc = remote ? Document_1.default.getByHref(remote) : __classPrivateFieldGet(this, _Parser_doc, "f");
        return (0, getValueByPath_1.default)(doc, paths);
    }
    getRefModal(ref) {
        if (!ref.includes('#'))
            return { modalType: 'unknown', type: 'unknown' };
        const { remote, paths } = this.parseRef(ref);
        if (paths[0] === 'definitions')
            paths.shift();
        if (remote)
            paths.unshift(Document_1.default.getNameByHref(remote));
        return { modalType: "ref", type: paths.join('.') };
    }
    parseSchema(schemaObj) {
        const schemaObjType = (0, nodeType_1.nodeType)(schemaObj);
        switch (schemaObjType) {
            case "ref": {
                // TODO: 支持远程类型
                return this.getRefModal(schemaObj.$ref);
            }
            case "string":
            case "number":
            case "boolean": {
                return {
                    modalType: 'primitives',
                    type: schemaObjType,
                };
            }
            case "enum": {
                // 枚举类型转换为 union A | B | C
                const modals = schemaObj.enum.map(item => {
                    return {
                        modalType: 'specific',
                        type: typeof item === "string" ? `'${item.replace(/'/g, "\\'")}'` : item,
                    };
                });
                return {
                    modalType: "union",
                    items: modals
                };
            }
            case "array": {
                if (Array.isArray(schemaObj.items)) {
                    // 转换为元组: [A, B, C]
                    return {
                        modalType: 'tuple',
                        items: schemaObj.items.map(schemaObjItem => this.parseSchema(schemaObjItem))
                    };
                }
                else {
                    // 转换成数组: A[]
                    return {
                        modalType: 'array',
                        type: this.parseSchema(schemaObj.items)
                    };
                }
            }
            case "object": {
                const { properties = {}, required = [] } = schemaObj;
                const requiredKeys = new Set(required);
                const objModal = {
                    modalType: 'object',
                    properties: [],
                };
                for (const [propName, propSchemaObj] of Object.entries(properties)) {
                    objModal.properties.push({
                        name: propName,
                        required: requiredKeys.has(propName),
                        description: propSchemaObj.description,
                        type: this.parseSchema(propSchemaObj),
                    });
                }
                if ('allOf' in schemaObj) {
                    /*
                     * 处理AllOf 所有模式皆有效
                     * 即 T & ( A & B & C )
                     * */
                    const allOfModals = schemaObj.allOf.map(allOfSchemaObj => this.parseSchema(allOfSchemaObj));
                    return {
                        modalType: "intersection",
                        items: [objModal, { modalType: 'intersection', items: allOfModals }]
                    };
                }
                else if ('oneOf' in schemaObj ||
                    'anyOf' in schemaObj) {
                    /*
                     * oneOf 其中一个模式有效
                     * anyOf 任意一个及以上模式有效
                     * 这里统一使用 union 即 T & ( A | B | C )
                     * */
                    const anyOfModals = (schemaObj.allOf || schemaObj.anyOf).map(subSchemaObj => this.parseSchema(subSchemaObj));
                    return {
                        modalType: "intersection",
                        items: [objModal, { modalType: 'union', items: anyOfModals }]
                    };
                }
                return objModal;
            }
        }
        return {
            modalType: "unknown",
            type: 'unknown'
        };
    }
    parseDefinitions(defNames = Object.keys(__classPrivateFieldGet(this, _Parser_doc, "f").definitions)) {
        for (const defName of defNames) {
            const defSchemaObj = __classPrivateFieldGet(this, _Parser_doc, "f").definitions[defName];
            const modal = this.parseSchema(defSchemaObj);
            if (modal.modalType === 'object') {
                __classPrivateFieldGet(this, _Parser_results, "f").definitions[defName] = {
                    modalType: 'interface',
                    name: defName,
                    description: defSchemaObj.description,
                    properties: modal.properties,
                };
            }
            else {
                // 使用类型别名
                __classPrivateFieldGet(this, _Parser_results, "f").definitions[defName] = {
                    modalType: 'typeAliases',
                    name: defName,
                    description: defSchemaObj.description,
                    type: modal,
                };
            }
        }
    }
    parseParameters(parameters = []) {
        const result = {};
        const recoveredParameters = parameters
            .map(param => {
            if (!(0, assertion_1.isReferenceObject)(param))
                return param;
            return this.getRefValue(param.$ref);
        })
            .filter(assertion_1.isNotNull);
        for (const param of recoveredParameters) {
            const paramIn = param.in;
            if ((0, assertion_1.isInBodyParameterObject)(param)) {
                result.body = {
                    modalType: 'typeAliases',
                    name: 'Body',
                    type: this.parseSchema(param.schema)
                };
            }
            else if (paramIn === 'formData') {
                result.body = {
                    modalType: 'typeAliases',
                    name: 'Body',
                    type: { modalType: 'specific', type: 'FormData' }
                };
            }
            else {
                if (!result[paramIn]) {
                    result[paramIn] = {
                        modalType: 'typeAliases',
                        name: (0, upperCaseFirstChar_1.default)(paramIn),
                        type: {
                            modalType: 'object',
                            properties: [],
                        }
                    };
                }
                result[paramIn].type.properties.push({
                    name: param.name,
                    description: param.description,
                    required: paramIn === 'path' || Boolean(param.required),
                    type: this.parseSchema({
                        type: param.type,
                        items: param.items,
                    })
                });
            }
        }
        return result;
    }
    parseResponse(responses) {
        var _a;
        const response = (_a = responses['200']) !== null && _a !== void 0 ? _a : responses.default;
        const responseType = {
            modalType: 'typeAliases',
            name: 'Response',
        };
        if (!response) {
            responseType.type = { modalType: 'unknown', type: 'unknown' };
        }
        else if ((0, assertion_1.isReferenceObject)(response)) {
            const recoveredResponse = this.getRefValue(response.$ref);
            responseType.type = recoveredResponse
                ? this.parseSchema(recoveredResponse.schema)
                : { modalType: 'unknown', type: 'unknown' };
        }
        else {
            responseType.type = this.parseSchema(response.schema);
        }
        return responseType;
    }
    parseEndpoints() {
        const pathsObj = __classPrivateFieldGet(this, _Parser_doc, "f").paths;
        const samePrefixCount = (0, path_1.getSamePrefixCount)(Object.keys(pathsObj));
        for (const [apiPath, pathItemObj] of Object.entries(pathsObj)) {
            Parser.operations.forEach(operation => {
                if (!pathItemObj[operation])
                    return;
                const endpointName = (0, path_1.getEndpointName)(apiPath, operation, samePrefixCount);
                const operationObj = pathItemObj[operation];
                let fullPath = `\"${apiPath}\"`;
                if (/\{.+\}/.test(fullPath)) {
                    fullPath = `\`${apiPath.replace(/\{(.+?)\}/g, '${path.$1}')}\``;
                }
                __classPrivateFieldGet(this, _Parser_results, "f").endpoints[endpointName] = {
                    name: endpointName,
                    fullPath,
                    operation: operation,
                    summary: operationObj.summary,
                    id: operationObj.operationId,
                    parameters: this.parseParameters(operationObj.parameters),
                    response: this.parseResponse(operationObj.responses),
                };
            });
        }
    }
    getResults() {
        return __classPrivateFieldGet(this, _Parser_results, "f");
    }
    parse() {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldSet(this, _Parser_doc, yield Document_1.default.add(this.config), "f");
            this.parseDefinitions();
            this.parseEndpoints();
            console.log('[INFO]: modal解析成功');
            return this.getResults();
        });
    }
}
_Parser_doc = new WeakMap(), _Parser_results = new WeakMap();
Parser.parsers = [];
Parser.operations = [
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
];
exports.default = Parser;
