"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = exports.readJsonFile = exports.readFile = exports.isReadable = exports.isFile = void 0;
const fs_1 = __importDefault(require("fs"));
const option = { encoding: 'utf-8' };
function isFile(path) {
    let isFile;
    try {
        const stat = fs_1.default.statSync(path);
        isFile = stat.isFile();
    }
    catch (err) {
        isFile = false;
    }
    return isFile;
}
exports.isFile = isFile;
function isReadable(path) {
    let readable;
    try {
        fs_1.default.accessSync(path, fs_1.default.constants.R_OK);
        readable = true;
    }
    catch (e) {
        readable = false;
    }
    return readable;
}
exports.isReadable = isReadable;
function readFile(path) {
    const content = fs_1.default.readFileSync(path, option);
    return content;
}
exports.readFile = readFile;
function readJsonFile(path) {
    const content = readFile(path);
    return JSON.parse(content);
}
exports.readJsonFile = readJsonFile;
function writeFile(path, content) {
    fs_1.default.writeFileSync(path, content, option);
}
exports.writeFile = writeFile;
