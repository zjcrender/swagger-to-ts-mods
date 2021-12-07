"use strict";
/** Decode $ref (https://swagger.io/docs/specification/using-ref/#escape) */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRef = exports.decodeRef = void 0;
function decodeRef(ref) {
    return ref.replace(/\~0/g, "~").replace(/\~1/g, "/").replace(/"/g, '\\"');
}
exports.decodeRef = decodeRef;
function encodeRef(ref) {
    return ref.replace(/\~/g, "~0").replace(/\//g, "~1");
}
exports.encodeRef = encodeRef;
