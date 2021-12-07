"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGeneralParameterObject = exports.isNotNull = exports.isInBodyParameterObject = exports.isReferenceObject = void 0;
function isReferenceObject(obj) {
    return '$ref' in obj;
}
exports.isReferenceObject = isReferenceObject;
function isInBodyParameterObject(obj) {
    return obj.in === 'body' && obj.schema;
}
exports.isInBodyParameterObject = isInBodyParameterObject;
function isNotNull(input) {
    return input !== null;
}
exports.isNotNull = isNotNull;
function isGeneralParameterObject(obj) {
    return 'in' in obj;
}
exports.isGeneralParameterObject = isGeneralParameterObject;
