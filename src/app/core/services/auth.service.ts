import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, User } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { setCookie, getCookie, removeCookie } from '../storage/cookie';

const TOKEN_COOKIE = 'af_token';
const PROFILE_KEY = 'af_user';
const SESSION_MAX_AGE_S = 60 * 60; // matches dummyjson expiresInMins:60

// Keys persisted by older builds that wrote the JWT to localStorage.
// Wiped on init so upgraders don't carry a token from the old code path.
const LEGACY_KEYS = ['af_access_token'];

type StoredProfile = Omit<User, 'accessToken'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiBaseUrl}/auth`;

  private http = inject(HttpClient);
  private router = inject(Router);

  // The JWT lives in a SameSite=Strict cookie; non-sensitive profile
  // data lives in localStorage. On boot we hydrate the signal from
  // both — if the cookie expired or was cleared, we ignore the stored
  // profile and treat the session as gone.
  //
  // A JS-readable cookie is not XSS-resistant. Genuine XSS-safe auth
  // requires an HttpOnly cookie issued by the server. Dummyjson does
  // not do that, so SameSite=Strict + Secure (over HTTPS) is the best
  // we can do client-side.
  private _user = signal<User | null>(this.hydrate());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly token = computed(() => this._user()?.accessToken ?? null);

  constructor() {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  }

  login(credentials: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.API}/login`, {
        ...credentials,
        expiresInMins: 60,
      })
      .pipe(
        tap((res) => {
          const profile: StoredProfile = {
            id: res.id,
            username: res.username,
            email: res.email,
            firstName: res.firstName,
            lastName: res.lastName,
            gender: res.gender,
            image: res.image,
          };
          setCookie(TOKEN_COOKIE, res.accessToken, {
            maxAgeSeconds: SESSION_MAX_AGE_S,
          });
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
          this._user.set({ ...profile, accessToken: res.accessToken });
        }),
      );
  }

  logout() {
    removeCookie(TOKEN_COOKIE);
    localStorage.removeItem(PROFILE_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private hydrate(): User | null {
    const token = getCookie(TOKEN_COOKIE);
    if (!token) return null;
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    try {
      const profile = JSON.parse(raw) as StoredProfile;
      return { ...profile, accessToken: token };
    } catch {
      return null;
    }
  }
}
