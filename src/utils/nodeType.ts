import type { SchemaObjectType, AnyObject } from '../types';

export function nodeType(obj: AnyObject): SchemaObjectType {
  if (!obj || typeof obj !== "object") {
    return "unknown";
  }

  if (obj.$ref) {
    return "ref";
  }

  // enum
  if (Array.isArray(obj.enum) && obj.enum.length) {
    return "enum";
  }

  // boolean
  if (obj.type === "boolean") {
    return "boolean";
  }

  // string
  if (["binary", "byte", "date", "dateTime", "password", "string"].includes(obj.type)) {
    return "string";
  }

  // number
  if (["double", "float", "integer", "number"].includes(obj.type)) {
    return "number";
  }

  // array
  if (obj.type === "array" && obj.items) {
    return "array";
  }

  // object
  if (
    obj.type === "object" ||
    obj.hasOwnProperty("allOf") ||
    obj.hasOwnProperty("anyOf") ||
    obj.hasOwnProperty("oneOf") ||
    obj.hasOwnProperty("properties") ||
    obj.hasOwnProperty("additionalProperties")
  ) {
    return "object";
  }

  // return unknown by default
  return "unknown";
}