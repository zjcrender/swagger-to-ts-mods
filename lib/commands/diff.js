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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const Diff = require('diff');
function diff() {
    return __awaiter(this, void 0, void 0, function* () {
        const one = 'bee1p boop';
        const other = 'beep boob blah';
        const diff = Diff.diffChars(one, other);
        const log = diff.map((part) => {
            // green for additions, red for deletions
            // grey for common parts
            console.log(part);
            const color = part.added ? 'green' :
                part.removed ? 'red' : 'grey';
            return chalk_1.default[color](part.value);
        });
        console.log(log.join(''));
    });
}
exports.default = diff;
