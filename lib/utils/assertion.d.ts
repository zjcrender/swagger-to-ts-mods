import type { OpenAPIV2, IJsonSchema } from 'openapi-types';
import type { AnyObject } from '../types';
export declare function isReferenceObject(obj: AnyObject): obj is OpenAPIV2.ReferenceObject;
export declare function isInBodyParameterObject(obj: OpenAPIV2.Parameter): obj is OpenAPIV2.InBodyParameterObject;
export declare function isNotNull<T>(input: T | null): input is T;
export declare function isGeneralParameterObject(obj: IJsonSchema | OpenAPIV2.GeneralParameterObject): obj is OpenAPIV2.GeneralParameterObject;
