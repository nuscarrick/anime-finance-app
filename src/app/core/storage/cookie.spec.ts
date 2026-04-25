import { describe, it, expect, beforeEach } from 'vitest';
import { setCookie, getCookie, removeCookie } from './cookie';

function clearAllCookies(): void {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  });
}

describe('cookie utility', () => {
  beforeEach(() => clearAllCookies());

  it('round-trips a simple value', () => {
    setCookie('plain', 'value');
    expect(getCookie('plain')).toBe('value');
  });

  it('returns null for an unknown name', () => {
    expect(getCookie('missing')).toBeNull();
  });

  it('encodes and decodes values containing reserved characters', () => {
    const tricky = 'a value; with=special chars';
    setCookie('weird', tricky);
    expect(getCookie('weird')).toBe(tricky);
  });

  it('encodes the cookie name itself', () => {
    setCookie('name with space', 'ok');
    expect(getCookie('name with space')).toBe('ok');
  });

  it('removeCookie clears a previously set value', () => {
    setCookie('tmp', 'present');
    expect(getCookie('tmp')).toBe('present');
    removeCookie('tmp');
    expect(getCookie('tmp')).toBeNull();
  });

  it('accepts maxAgeSeconds without throwing', () => {
    expect(() => setCookie('ttl', 'x', { maxAgeSeconds: 3600 })).not.toThrow();
    expect(getCookie('ttl')).toBe('x');
  });

  it('does not return a value with a similar prefix', () => {
    setCookie('af_token', 'real');
    setCookie('af_token_other', 'fake');
    expect(getCookie('af_token')).toBe('real');
    expect(getCookie('af_token_other')).toBe('fake');
  });
});
