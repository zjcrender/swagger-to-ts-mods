import { OriginConfig, ParserResult } from "./types";
declare class Parser {
    #private;
    private config;
    static parsers: Parser[];
    static operations: string[];
    constructor(config: OriginConfig);
    private parseRef;
    private getRefValue;
    private getRefModal;
    private parseSchema;
    private parseDefinitions;
    private parseParameters;
    private parseResponse;
    private parseEndpoints;
    getResults(): ParserResult;
    parse(): Promise<ParserResult>;
}
export default Parser;
