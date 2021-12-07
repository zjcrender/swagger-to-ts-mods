import type { OpenAPIV2, IJsonSchema } from 'openapi-types';
import type { AnyObject } from '../types';

export function isReferenceObject(obj: AnyObject): obj is OpenAPIV2.ReferenceObject {
  return '$ref' in obj;
}

export function isInBodyParameterObject(obj: OpenAPIV2.Parameter): obj is OpenAPIV2.InBodyParameterObject {
  return obj.in === 'body' && obj.schema;
}

export function isNotNull<T>(input: T | null): input is T {
  return input !== null;
}

export function isGeneralParameterObject(obj: IJsonSchema | OpenAPIV2.GeneralParameterObject): obj is OpenAPIV2.GeneralParameterObject {
  return 'in' in obj;
}
