import { Modal, ParserResult, Property } from "./types";
export declare class CodeGenerator {
    #private;
    constructor(parserResults: Record<string, ParserResult>);
    makeComment(text?: string): string;
    makePropertyTypes(props: Property[]): string;
    makeModalType(modal: Modal): string;
    transform(): void;
    makeDeclaration(): void;
    makeEndpoints(): void;
    make(): void;
}
