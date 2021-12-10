import {
  MappedParameters,
  Modal,
  ObjectModal,
  OriginConfig,
  ParameterIn,
  ParserResult,
  Ref,
  TypeAliasesModal
} from "./types";
import { IJsonSchema, OpenAPIV2 } from "openapi-types";
import document from "./Document";
import { nodeType } from "./utils/nodeType";
import { isInBodyParameterObject, isNotNull, isReferenceObject } from "./utils/assertion";
import { getEndpointName, getSamePrefixCount } from "./utils/path";
import { decodeRef } from "./utils/ref";
import getValueByPath from "./utils/getValueByPath";
import upperCaseFirstChar from "./utils/upperCaseFirstChar";

class Parser {
  #doc: undefined | OpenAPIV2.Document;
  #results: ParserResult = { name: 'unset', definitions: {}, endpoints: {} };

  static parsers: Parser[] = [];

  static operations: string[] = [
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
  ]

  constructor(private config: OriginConfig) {
    this.#results.name = config.originName;
    Parser.parsers.push(this);
  }

  private parseRef(ref: string): Ref {
    const [remote, path] = ref.split('#');
    const paths = path.split('/').filter(Boolean).map(decodeRef);

    return { remote, paths };
  }

  private getRefValue<T>(ref: string): T | null {
    if (!ref.includes('#')) return null;

    const { remote, paths } = this.parseRef(ref);
    const doc = remote ? document.getByHref(remote) : this.#doc;

    return getValueByPath<T>(doc, paths);
  }

  private getRefModal(ref: string): Modal {
    if (!ref.includes('#')) return { modalType: 'unknown', type: 'unknown' };

    const { remote, paths } = this.parseRef(ref);
    if (paths[0] === 'definitions') paths.shift();
    if (remote) paths.unshift(document.getNameByHref(remote));

    return { modalType: "ref", type: paths.join('.') }
  }

  private parseSchema(schemaObj: IJsonSchema): Modal {
    const schemaObjType = nodeType(schemaObj);

    switch (schemaObjType) {
      case "ref": {
        // TODO: 支持远程类型
        return this.getRefModal(schemaObj.$ref!);
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
        const modals: Modal[] = schemaObj.enum!.map<Modal>(item => {
          return {
            modalType: 'specific',
            type: typeof item === "string" ? `'${ item.replace(/'/g, "\\'") }'` : item,
          }
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
          }
        } else {
          // 转换成数组: A[]
          return {
            modalType: 'array',
            type: this.parseSchema(schemaObj.items!)
          }
        }
      }

      case "object": {
        const {
          properties = {},
          required = []
        } = schemaObj;

        const requiredKeys = new Set(required);

        const objModal: Modal = {
          modalType: 'object',
          properties: [],
        }

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
          const allOfModals = schemaObj.allOf!.map(allOfSchemaObj => this.parseSchema(allOfSchemaObj));
          return {
            modalType: "intersection",
            items: [objModal, { modalType: 'intersection', items: allOfModals }]
          }
        } else if (
          'oneOf' in schemaObj ||
          'anyOf' in schemaObj
        ) {
          /*
           * oneOf 其中一个模式有效
           * anyOf 任意一个及以上模式有效
           * 这里统一使用 union 即 T & ( A | B | C )
           * */
          const anyOfModals = (schemaObj.allOf || schemaObj.anyOf)!.map(subSchemaObj => this.parseSchema(subSchemaObj));
          return {
            modalType: "intersection",
            items: [objModal, { modalType: 'union', items: anyOfModals }]
          }
        }

        return objModal;
      }
    }

    return {
      modalType: "unknown",
      type: 'unknown'
    };
  }

  private parseDefinitions(defNames = Object.keys(this.#doc!.definitions!)) {

    for (const defName of defNames) {
      const defSchemaObj = this.#doc!.definitions![defName];
      const modal: Modal = this.parseSchema(defSchemaObj);

      if (modal.modalType === 'object') {
        this.#results.definitions[defName] = {
          modalType: 'interface',
          name: defName,
          description: defSchemaObj.description,
          properties: modal.properties,
        }
      } else {
        // 使用类型别名
        this.#results.definitions[defName] = {
          modalType: 'typeAliases',
          name: defName,
          description: defSchemaObj.description,
          type: modal,
        }
      }
    }

  }

  private parseParameters(parameters: OpenAPIV2.Parameters = []): MappedParameters {
    const result: MappedParameters = {};

    const recoveredParameters: OpenAPIV2.Parameter[] = parameters
      .map(param => {
        if (!isReferenceObject(param)) return param;
        return this.getRefValue<OpenAPIV2.Parameter>(param.$ref);
      })
      .filter(isNotNull);

    for (const param of recoveredParameters) {
      const paramIn = param.in as ParameterIn;

      if (isInBodyParameterObject(param)) {
        result.body = {
          modalType: 'typeAliases',
          name: 'Body',
          type: this.parseSchema(param.schema)
        };
      } else if (paramIn === 'formData') {
        result.body = {
          modalType: 'typeAliases',
          name: 'Body',
          type: { modalType: 'specific', type: 'FormData' }
        };
      } else {
        if (!result[paramIn]) {
          result[paramIn] = {
            modalType: 'typeAliases',
            name: upperCaseFirstChar(paramIn),
            type: {
              modalType: 'object',
              properties: [],
            }
          }
        }
        ((result[paramIn] as TypeAliasesModal)!.type as ObjectModal).properties.push({
          name: param.name,
          description: param.description,
          required: paramIn === 'path' || Boolean(param.required),
          type: this.parseSchema(param as OpenAPIV2.SchemaObject)
        })
      }
    }

    return result;
  }

  private parseResponse(responses: OpenAPIV2.ResponsesObject) {
    const response: OpenAPIV2.Response | undefined = responses['200'] ?? responses.default;

    const responseType = {
      modalType: 'typeAliases',
      name: 'Response',
    } as TypeAliasesModal;

    if (!response) {
      responseType.type = { modalType: 'unknown', type: 'unknown' }
    } else if (isReferenceObject(response)) {
      const recoveredResponse = this.getRefValue<OpenAPIV2.ResponseObject>(response.$ref);

      responseType.type = recoveredResponse
        ? this.parseSchema(recoveredResponse.schema!)
        : { modalType: 'unknown', type: 'unknown' }
    } else {
      responseType.type = this.parseSchema(response.schema!)
    }

    return responseType;
  }

  private parseEndpoints() {
    const pathsObj = this.#doc!.paths;
    const samePrefixCount = getSamePrefixCount(Object.keys(pathsObj));

    for (const [apiPath, pathItemObj] of Object.entries(pathsObj)) {
      (Parser.operations as OpenAPIV2.HttpMethods[]).forEach(operation => {
        if (!pathItemObj[operation]) return;

        const endpointName = getEndpointName(apiPath, operation, samePrefixCount);

        const operationObj: OpenAPIV2.OperationObject = pathItemObj[operation]!;

        let fullPath = `\"${ apiPath }\"`;
        if (/\{.+\}/.test(fullPath)) {
          fullPath = `\`${ apiPath.replace(/\{(.+?)\}/g, '${path.$1}') }\``
        }

        this.#results.endpoints[endpointName] = {
          name: endpointName,
          fullPath,
          operation: operation,
          summary: operationObj.summary,
          id: operationObj.operationId,
          parameters: this.parseParameters(operationObj.parameters),
          response: this.parseResponse(operationObj.responses),
        }
      })
    }
  }

  public getResults() {
    return this.#results;
  }

  public async parse(): Promise<ParserResult> {
    this.#doc = await document.add(this.config);

    this.parseDefinitions();

    this.parseEndpoints();

    console.log('[INFO]: modal解析成功')

    return this.getResults();
  }

}

export default Parser;
