"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getValueByPath(data, paths) {
    try {
        return paths.reduce((obj, key) => obj[key], data);
    }
    catch (e) {
        return null;
    }
}
exports.default = getValueByPath;
