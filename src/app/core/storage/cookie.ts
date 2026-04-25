// Thin wrapper over document.cookie. Always sets SameSite=Strict and
// adds Secure when the page is served over HTTPS. Note: a JS-readable
// cookie is not XSS-resistant — true XSS-safe storage requires an
// HttpOnly cookie issued by the server. SameSite still buys CSRF
// protection over localStorage, which is the relevant gain here.

export interface CookieOptions {
  maxAgeSeconds?: number;
  path?: string;
}

export function setCookie(name: string, value: string, opts: CookieOptions = {}): void {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path ?? '/'}`);
  if (opts.maxAgeSeconds !== undefined) parts.push(`Max-Age=${opts.maxAgeSeconds}`);
  parts.push('SameSite=Strict');
  if (typeof location !== 'undefined' && location.protocol === 'https:') {
    parts.push('Secure');
  }
  document.cookie = parts.join('; ');
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const target = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split('; ')) {
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length));
    }
  }
  return null;
}

export function removeCookie(name: string, path = '/'): void {
  document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0; SameSite=Strict`;
}
