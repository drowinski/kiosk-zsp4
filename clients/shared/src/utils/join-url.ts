// Source: https://www.30secondsofcode.org/js/s/join-url-segments/
// License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
export function joinUrl(...parts: string[]) {
  return parts
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/^(.+):\//, '$1://')
    .replace(/^file:/, 'file:/')
    .replace(/\/(\?|&|#[^!])/g, '$1')
    .replace(/\?/g, '&')
    .replace('&', '?');
}
