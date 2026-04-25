import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, User } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const USER_KEY = 'af_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiBaseUrl}/auth`;

  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(this.loadStoredUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly token = computed(() => this._user()?.accessToken ?? null);

  login(credentials: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.API}/login`, {
        ...credentials,
        expiresInMins: 60,
      })
      .pipe(
        tap((res) => {
          const user: User = {
            id: res.id,
            username: res.username,
            email: res.email,
            firstName: res.firstName,
            lastName: res.lastName,
            gender: res.gender,
            image: res.image,
            accessToken: res.accessToken,
          };
          this._user.set(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        })
      );
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
