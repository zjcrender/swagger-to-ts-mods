import { URL } from "url";
import { combinePaths } from "./path";

export default function getNameByHref(href: string): string {
  const { protocol, hostname, port, pathname } = new URL(href);
  const parts: string[] = [];

  /**
   * protocol_hostname[_port][_pathname]
   * e.g. http_exampleCom_8080_ApiV1Doc
   * */
  parts.push(protocol.replace(':', ''));
  parts.push(combinePaths(hostname.split('.')));
  port && parts.push(port);
  pathname && parts.push(combinePaths(pathname.split('/')));

  return parts.join('_');
}