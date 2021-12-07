/** Decode $ref (https://swagger.io/docs/specification/using-ref/#escape) */

export function decodeRef(ref: string): string {
  return ref.replace(/\~0/g, "~").replace(/\~1/g, "/").replace(/"/g, '\\"');
}

export function encodeRef(ref: string): string {
  return ref.replace(/\~/g, "~0").replace(/\//g, "~1");
}