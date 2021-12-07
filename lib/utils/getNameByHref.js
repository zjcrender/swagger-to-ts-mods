"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const path_1 = require("./path");
function getNameByHref(href) {
    const { protocol, hostname, port, pathname } = new url_1.URL(href);
    const parts = [];
    /**
     * protocol_hostname[_port][_pathname]
     * e.g. http_exampleCom_8080_ApiV1Doc
     * */
    parts.push(protocol.replace(':', ''));
    parts.push((0, path_1.combinePaths)(hostname.split('.')));
    port && parts.push(port);
    pathname && parts.push((0, path_1.combinePaths)(pathname.split('/')));
    return parts.join('_');
}
exports.default = getNameByHref;
