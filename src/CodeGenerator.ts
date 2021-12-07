import {
  Modal,
  OriginConfig,
  ParameterIn,
  ParserResult,
  Property,
  TemplateData,
  TemplateDefinition,
  TemplateEndpoints
} from "./types";
import confIns from "./Config";
import { readFile, writeFile } from "./utils/file";
import path from "path";
import Mustache from "mustache";
import prettier from "prettier";
import fs from 'fs';
import chalk from "chalk";

export class CodeGenerator {
  readonly #parserResults: Record<string, ParserResult> = {};
  #templateData: TemplateData = { origins: [] };

  constructor(parserResults: Record<string, ParserResult>) {
    this.#parserResults = parserResults;
  }

  public makeComment(text?: string): string {
    if (!text) return '';

    let commentText = text.trim().replace(/\*\//g, "*\\/");

    // 单行
    if (commentText.indexOf("\n") === -1) {
      return `\/** ${ commentText } *\/\n`;
    }

    // 多行
    commentText = ' * ' + commentText;
    let lines: string[] = [
      '\/**',
      ...commentText.replace(/\r?\n/g, " * \n").split('\n'),
      ' * *\/'
    ];
    return lines.join('');
  }

  public makePropertyTypes(props: Property[]): string {

    // TODO: 处理无property时的类型
    if (props.length === 0) return '{ [props: string]: unknown }';

    let output = '{\n';

    props.forEach(prop => {
      const { name, required, description, type } = prop;
      const requiredFlag = required ? '' : '?';
      output += `${ this.makeComment(description) }${ name }${ requiredFlag }: ${ this.makeModalType(type) }\n`;
    })

    output += '}';
    return output;
  }

  public makeModalType(modal: Modal): string {

    let output: string;

    switch (modal.modalType) {

      case "typeAliases": {
        const { name, description, type } = modal;
        output = `${ this.makeComment(description) }type ${ name } = ${ this.makeModalType(type) }`;
        break;
      }

      case "interface": {
        const { name, description, properties } = modal;
        output = `${ this.makeComment(description) }interface ${ name } ${ this.makePropertyTypes(properties) }`;
        break;
      }

      case "object": {
        output = `${ this.makePropertyTypes(modal.properties) }`;
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
        output = `${ this.makeModalType(modal.type) }[]`;
        break;
      }

      case "tuple": {
        output = `${ modal.items.map(this.makeModalType) }`;
        break;
      }

      case "union": {
        output = `(${ modal.items.map(this.makeModalType).join('|') })`;
        break;
      }

      case "intersection": {
        output = `(${ modal.items.map(this.makeModalType).join('&') })`;
        break;
      }

      default: {
        const unhandledModal: never = modal;
        console.error('未知类型:', `${ unhandledModal }`);
        process.exit(-1);
      }

    }

    return output;
  }

  public transform() {
    const tplData: TemplateData = { origins: [] };

    const mappedOrigins: Record<string, OriginConfig> = {};
    for (const origin of confIns.get().origins) {
      mappedOrigins[origin.originName] = origin;
    }

    for (const [originName, parserResult] of Object.entries(this.#parserResults)) {
      const definitionsData: TemplateDefinition[] = [];
      for (const [modalName, modal] of Object.entries(parserResult.definitions)) {
        definitionsData.push({
          name: modalName,
          interface: this.makeModalType(modal),
        })
      }

      const endpointsData: TemplateEndpoints[] = [];
      for (const [operationName, operation] of Object.entries(parserResult.endpoints)) {
        const data: TemplateEndpoints = {
          name: operationName,
          id: operation.id,
          operation: operation.operation,
          fullPath: operation.fullPath,
          description: this.makeComment(operation.summary),
          response: this.makeModalType(operation.response)
        }
        for (const [paramIn, paramModal] of Object.entries(operation.parameters)) {
          data[paramIn as ParameterIn] = this.makeModalType(paramModal);
        }
        endpointsData.push(data);
      }

      tplData.origins.push({
        name: originName,
        request: mappedOrigins[originName].request!,
        definitions: definitionsData,
        endpoints: endpointsData,
      })
    }

    this.#templateData = tplData;
  }

  public makeDeclaration() {
    const { templateDir, outputDir } = confIns.get();

    const tpl = readFile(path.resolve(templateDir, 'API.d.mustache'));
    const content = Mustache.render(tpl, this.#templateData);
    const result = prettier.format(content, { parser: "typescript", });

    fs.mkdirSync(path.resolve(outputDir), { recursive: true });
    writeFile(path.resolve(outputDir, 'API.d.ts'), result);
    console.log('[INFO]: 类型文件生成成功');
  }

  public makeEndpoints() {

    const { templateDir, outputDir } = confIns.get();

    const tpl = readFile(path.resolve(templateDir, 'operation.mustache'));

    this.#templateData.origins.forEach(origin => {
      const { name, endpoints, request } = origin;
      fs.mkdirSync(path.resolve(outputDir, name), { recursive: true });

      endpoints.forEach(endpoint => {
        const filePath = path.resolve(outputDir, name, `${endpoint.name}.ts`);
        const content = Mustache.render(tpl, { originName: name, ...request, ...endpoint });
        const result = prettier.format(content, { parser: "typescript", });

        writeFile(filePath, result);
        console.log(`[INFO]: 模块 [${chalk.blue(name)}] 已生成函数：${chalk.green(endpoint.name)}`);
      })

    })

  }

  public make() {

    this.transform();
    this.makeDeclaration();
    this.makeEndpoints();

  }

}
