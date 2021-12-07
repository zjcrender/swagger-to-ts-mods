import type { OpenAPIV2 } from "openapi-types";
import type { OriginConfig } from "./types";
/**
 * 只做两件事
 * 1. 下载并保存文档，方便按名称索引
 * 2. 未指定文档名时根据路径生成一个名称
 * */
export declare class Document {
    #private;
    getNameByHref(href: string): string;
    add(originConfig: OriginConfig): Promise<OpenAPIV2.Document<{}>>;
    get(docName: string): OpenAPIV2.Document<{}> | undefined;
    getByHref(href: string): OpenAPIV2.Document<{}> | undefined;
    private fetch;
}
declare const _default: Document;
export default _default;
