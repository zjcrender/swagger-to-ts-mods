import upperCaseFirstChar from "./upperCaseFirstChar";

export function getSamePrefixCount(paths: string[]): number {
  const splitPaths = paths.map(path => path.split('/'));
  const shortest = splitPaths.sort((a, b) => a.length - b.length)[0];

  let idx = 0;
  while (idx < shortest.length - 1) {
    const eq = splitPaths.every(parts => !parts[idx].startsWith('{') && parts[idx] === shortest[idx]);
    if (!eq) break;
    idx++
  }

  return idx;
}

export function combinePaths(paths: string[]): string {
  return paths.reduce((name, path) => {
    // {abc} => ByAbc
    if (/\{(.+?)\}/g.test(path)) {
      path = path.replace(/\{(.+?)\}/g, (m, p1) => 'By' + upperCaseFirstChar(p1));
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

export function getEndpointName(
  path: string,
  operation: string,
  samePrefixCount: number
) {
  const paths: string[] = path.split('/').slice(samePrefixCount);

  return operation + combinePaths(paths);
}