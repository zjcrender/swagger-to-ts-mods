"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function* asyncQueue(queue) {
    for (let i = 0; i < queue.length; i++) {
        yield queue[i]();
    }
}
exports.default = asyncQueue;
