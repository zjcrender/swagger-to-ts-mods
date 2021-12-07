"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEndpointName = exports.combinePaths = exports.getSamePrefixCount = void 0;
const upperCaseFirstChar_1 = __importDefault(require("./upperCaseFirstChar"));
function getSamePrefixCount(paths) {
    const splitPaths = paths.map(path => path.split('/'));
    const shortest = splitPaths.sort((a, b) => a.length - b.length)[0];
    let idx = 0;
    while (idx < shortest.length - 1) {
        const eq = splitPaths.every(parts => !parts[idx].startsWith('{') && parts[idx] === shortest[idx]);
        if (!eq)
            break;
        idx++;
    }
    return idx;
}
exports.getSamePrefixCount = getSamePrefixCount;
function combinePaths(paths) {
    return paths.reduce((name, path) => {
        // {abc} => ByAbc
        if (/\{(.+?)\}/g.test(path)) {
            path = path.replace(/\{(.+?)\}/g, (m, p1) => 'By' + (0, upperCaseFirstChar_1.default)(p1));
        }
        // ab-cd => abCd ab_cd => abCd
        if (/[-_]/.test(path)) {
            path = path.replace(/[-_](\w)/g, (m, p1) => p1.toUpperCase());
        }
        // abc => Abc
        path = path.replace(/^[a-z]/, m => m.toUpperCase());
        return name + path;
    }, '');
}
exports.combinePaths = combinePaths;
function getEndpointName(path, operation, samePrefixCount) {
    const paths = path.split('/').slice(samePrefixCount);
    return operation + combinePaths(paths);
}
exports.getEndpointName = getEndpointName;
