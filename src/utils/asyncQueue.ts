export default function* asyncQueue<T>(queue: (() => T)[]) {
  for (let i = 0; i < queue.length; i++) {
    yield queue[i]();
  }
}
