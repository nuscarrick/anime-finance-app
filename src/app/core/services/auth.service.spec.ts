import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { setCookie } from '../storage/cookie';

function clearStorage(): void {
  localStorage.clear();
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  });
}

function configure(): void {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([{ path: 'login', children: [] }]),
    ],
  });
}

const PROFILE = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: 'https://x/avatar.png',
};

describe('AuthService', () => {
  beforeEach(() => {
    clearStorage();
    configure();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('starts logged out when there is no cookie', () => {
    const service = TestBed.inject(AuthService);
    expect(service.isLoggedIn()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  });

  it('login stores the JWT in a cookie and the profile in localStorage', () => {
    const service = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.login({ username: 'emilys', password: 'emilyspass' }).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/auth/login'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({
      username: 'emilys',
      password: 'emilyspass',
      expiresInMins: 60,
    });
    req.flush({ ...PROFILE, accessToken: 'jwt-123' });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.token()).toBe('jwt-123');

    // Token in cookie
    expect(document.cookie).toContain('af_token=jwt-123');

    // Profile in localStorage — without the access token
    const stored = JSON.parse(localStorage.getItem('af_user')!) as Record<string, unknown>;
    expect(stored['username']).toBe('emilys');
    expect(stored['accessToken']).toBeUndefined();
  });

  it('logout clears cookie, localStorage, and the user signal', () => {
    const service = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.login({ username: 'emilys', password: 'emilyspass' }).subscribe();
    httpMock
      .expectOne((r) => r.url.endsWith('/auth/login'))
      .flush({ ...PROFILE, accessToken: 'jwt-456' });
    expect(service.isLoggedIn()).toBe(true);

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.token()).toBeNull();
    expect(localStorage.getItem('af_user')).toBeNull();
    expect(document.cookie).not.toContain('af_token=');
  });

  it('hydrates the session from cookie + localStorage on construction', () => {
    setCookie('af_token', 'jwt-from-storage');
    localStorage.setItem('af_user', JSON.stringify(PROFILE));

    const service = TestBed.inject(AuthService);

    expect(service.isLoggedIn()).toBe(true);
    expect(service.token()).toBe('jwt-from-storage');
    expect(service.user()?.username).toBe('emilys');
  });

  it('ignores the stored profile when the cookie is missing (token expired)', () => {
    // Profile present, no cookie
    localStorage.setItem('af_user', JSON.stringify(PROFILE));

    const service = TestBed.inject(AuthService);

    expect(service.isLoggedIn()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('purges the legacy af_access_token key on init', () => {
    localStorage.setItem('af_access_token', 'old-junk');
    TestBed.inject(AuthService);
    expect(localStorage.getItem('af_access_token')).toBeNull();
  });
});
