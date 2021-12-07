export default function asyncQueue<T>(queue: (() => T)[]): Generator<T, void, unknown>;
