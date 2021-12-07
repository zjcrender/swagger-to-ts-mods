export default function getValueByPath<T>(data: any, paths: string[]): T | null {
  try {
    return paths.reduce((obj, key) => obj[key], data) as T;
  } catch (e) {
    return null;
  }
}