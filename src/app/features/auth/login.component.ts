import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, lockClosedOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ion-page' },
  imports: [IonContent, IonSpinner, IonIcon],
  template: `
    <ion-content>
      <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
           style="background: linear-gradient(135deg, #0f0f1a 0%, #16162a 50%, #1a0f2e 100%)">

        <!-- Background orbs -->
        <div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
             style="background: #6c63ff; animation: float 6s ease-in-out infinite;"></div>
        <div class="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
             style="background: #ff6584; animation: float 8s ease-in-out infinite reverse;"></div>

        <div class="w-full max-w-sm page-enter">
          <!-- Logo -->
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-accent mb-4 pulse-glow">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 14V26L20 36L4 26V14L20 4Z" fill="white" opacity="0.9"/>
                <path d="M20 10L30 16V24L20 30L10 24V16L20 10Z" fill="white" opacity="0.4"/>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-white mb-1">FinanceFlow</h1>
            <p style="color: #8b8bad" class="text-sm">Manage your money smarter</p>
          </div>

          <!-- Card -->
          <div class="glass-card p-6">
            <h2 class="text-xl font-semibold text-white mb-6">Welcome back</h2>

            <!-- Username -->
            <div class="mb-4">
              <label class="text-xs font-medium mb-2 block" style="color: #8b8bad">USERNAME</label>
              <div class="relative">
                <ion-icon name="person-outline"
                  class="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                  style="color: #6c63ff; font-size: 18px;"></ion-icon>
                <input
                  type="text"
                  [value]="username()"
                  (input)="username.set($any($event.target).value)"
                  (change)="username.set($any($event.target).value)"
                  placeholder="emilys"
                  autocomplete="username"
                  class="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                  style="background: rgba(30,30,53,0.9); border: 1px solid rgba(108,99,255,0.2); color: white;"
                  (focus)="onFocus($event)"
                  (blur)="onBlur($event)"
                  (keydown.enter)="onLogin()"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="mb-6">
              <label class="text-xs font-medium mb-2 block" style="color: #8b8bad">PASSWORD</label>
              <div class="relative">
                <ion-icon name="lock-closed-outline"
                  class="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                  style="color: #6c63ff; font-size: 18px;"></ion-icon>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  [value]="password()"
                  (input)="password.set($any($event.target).value)"
                  (change)="password.set($any($event.target).value)"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style="background: rgba(30,30,53,0.9); border: 1px solid rgba(108,99,255,0.2); color: white;"
                  (focus)="onFocus($event)"
                  (blur)="onBlur($event)"
                  (keydown.enter)="onLogin()"
                />
                <button
                  (click)="togglePassword()"
                  class="absolute right-3 top-1/2 -translate-y-1/2"
                  style="background: none; border: none; cursor: pointer; color: #8b8bad;">
                  <ion-icon [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'"
                    style="font-size: 18px;"></ion-icon>
                </button>
              </div>
            </div>

            <!-- Error -->
            @if (error()) {
              <div class="mb-4 px-4 py-3 rounded-xl text-sm"
                   style="background: rgba(255,101,132,0.15); border: 1px solid rgba(255,101,132,0.3); color: #ff6584;">
                {{ error() }}
              </div>
            }

            <!-- Login Button -->
            <button
              (click)="onLogin()"
              [disabled]="loading() || !canSubmit()"
              class="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all duration-200 relative overflow-hidden"
              style="background: linear-gradient(135deg, #6c63ff, #a855f7);"
              [style.opacity]="loading() || !canSubmit() ? '0.7' : '1'"
              [style.transform]="pressing() ? 'scale(0.97)' : 'scale(1)'"
              (mousedown)="pressing.set(true)"
              (mouseup)="pressing.set(false)"
              (mouseleave)="pressing.set(false)">
              @if (loading()) {
                <ion-spinner name="crescent" style="color: white; width: 20px; height: 20px;"></ion-spinner>
              } @else {
                Sign In
              }
            </button>

            <!-- Hint -->
            <p class="text-center text-xs mt-4" style="color: #8b8bad">
              Demo: <span class="font-mono" style="color: #6c63ff">emilys</span> /
              <span class="font-mono" style="color: #6c63ff">emilyspass</span>
            </p>
          </div>
        </div>
      </div>
    </ion-content>

    <style>
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      input::placeholder { color: #8b8bad; }
    </style>
  `,
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  pressing = signal(false);

  canSubmit = computed(() => this.username().length > 0 && this.password().length > 0);

  constructor(private auth: AuthService, private router: Router) {
    addIcons({ eyeOutline, eyeOffOutline, lockClosedOutline, personOutline });
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onFocus(e: Event) {
    const el = e.target as HTMLElement;
    el.style.borderColor = 'rgba(108,99,255,0.6)';
    el.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)';
  }

  onBlur(e: Event) {
    const el = e.target as HTMLElement;
    el.style.borderColor = 'rgba(108,99,255,0.2)';
    el.style.boxShadow = 'none';
  }

  onLogin() {
    if (!this.canSubmit() || this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ username: this.username(), password: this.password() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/app/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Invalid credentials. Please try again.');
      },
    });
  }
}
