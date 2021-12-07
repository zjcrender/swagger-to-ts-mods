import type { OpenAPIV2 } from "openapi-types";
import type { OriginConfig } from "./types";
import SwaggerParser from "@apidevtools/swagger-parser";
import getNameByHref from "./utils/getNameByHref";

/**
 * 只做两件事
 * 1. 下载并保存文档，方便按名称索引
 * 2. 未指定文档名时根据路径生成一个名称
 * */
export class Document {

  #docs = new Map<string, OpenAPIV2.Document>();
  #originNameMap = new Map<string, string>();
  #local = new Set<string>();

  public getNameByHref(href: string): string {
    if (this.#originNameMap.has(href)) return this.#originNameMap.get(href)!;

    const name = getNameByHref(href);
    this.#originNameMap.set(href, name);
    return name;
  }

  public async add(originConfig: OriginConfig) {
    const {
      origin,
      originName = this.getNameByHref(origin),
    } = originConfig;

    if (this.#docs.has(originName)) return this.#docs.get(originName)!;

    console.log(`[INFO]: 获取文档 ${ origin }`)
    const doc = await this.fetch(originConfig.origin);

    doc.definitions = doc.definitions || {};

    // 指定名称时不再通过getNameByHref生成
    this.#originNameMap.set(origin, originName);
    this.#docs.set(originName, doc);

    return doc;
  }

  public get(docName: string) {
    return this.#docs.get(docName);
  }

  public getByHref(href: string) {
    return this.get(this.getNameByHref(href));
  }

  private fetch(origin: string) {
    return SwaggerParser.parse(origin) as Promise<OpenAPIV2.Document>;
  }

}

export default new Document();
