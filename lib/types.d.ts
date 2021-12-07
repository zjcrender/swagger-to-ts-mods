export interface RequestConfig {
    filePath: string;
    methodName: string;
    default: boolean;
}
export interface OriginConfig {
    origin: string;
    originName: string;
    request?: RequestConfig;
}
export declare type Config = {
    request: RequestConfig;
    handleUnknownType: 'unknown' | 'generic' | 'any';
    outputDir: string;
    templateDir: string;
    origins: OriginConfig[];
};
export interface Property {
    name: string;
    required: boolean;
    description?: string;
    type: Modal;
}
export interface ObjectModal {
    modalType: 'object';
    properties: Property[];
}
export interface InterfaceModal {
    modalType: 'interface';
    name: string;
    description?: string;
    properties: Property[];
}
export interface TypeAliasesModal {
    modalType: 'typeAliases';
    name: string;
    description?: string;
    type: Modal;
}
export interface PrimitivesModal {
    modalType: 'primitives';
    type: "string" | "number" | "boolean";
}
export interface UnknownModal {
    modalType: 'unknown';
    type: "unknown";
}
export interface SpecificModal {
    modalType: 'specific';
    type: string;
}
export interface RefModal {
    modalType: 'ref';
    type: string;
}
export interface ArrayModal {
    modalType: 'array';
    type: Modal;
}
export interface TupleModal {
    modalType: 'tuple';
    items: Modal[];
}
export interface UnionModal {
    modalType: 'union';
    items: Modal[];
}
export interface IntersectionModal {
    modalType: 'intersection';
    items: Modal[];
}
export declare type Modal = PrimitivesModal | UnknownModal | SpecificModal | RefModal | ArrayModal | TupleModal | UnionModal | IntersectionModal | ObjectModal | TypeAliasesModal | InterfaceModal;
export interface Ref {
    remote?: string;
    paths: string[];
}
export declare type SchemaObjectType = "string" | "boolean" | "number" | "array" | "enum" | "object" | "ref" | "unknown";
export interface AnyObject {
    [p: string]: any;
}
export declare type ParameterIn = 'path' | 'query' | 'header' | 'formData' | 'body';
export declare type MappedParameters = Partial<Record<ParameterIn, Modal>>;
export interface Operation {
    name: string;
    fullPath: string;
    operation: string;
    summary?: string;
    id?: string;
    parameters: MappedParameters;
    response: Modal;
}
export interface DocReflect {
    [props: string]: any;
}
export interface Defaults {
    REQUEST: RequestConfig;
    CONFIG_PATH: string;
    TEMPLATE_DIR: string;
    OUTPUT_DIR: string;
}
export interface ParserResult {
    name: string;
    definitions: Record<string, Modal>;
    endpoints: Record<string, Operation>;
}
export interface TemplateDefinition {
    name: string;
    interface: string;
}
export declare type TemplateEndpoints = {
    name: string;
    id?: string;
    fullPath: string;
    operation: string;
    description?: string;
    response: string;
} & {
    [p in ParameterIn]?: string;
};
export interface TemplateOrigin {
    name: string;
    request: RequestConfig;
    definitions: TemplateDefinition[];
    endpoints: TemplateEndpoints[];
}
export interface TemplateData {
    origins: TemplateOrigin[];
}
