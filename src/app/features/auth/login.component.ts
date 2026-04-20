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
      <div class="min-h-screen flex items-center justify-center px-5 relative overflow-hidden"
           style="background: linear-gradient(160deg, #e8f4ff 0%, #d4eafe 60%, #c8e0ff 100%);">

        <!-- Decorative orbs -->
        <div class="absolute top-1/4 -left-16 w-64 h-64 rounded-full pointer-events-none"
             style="background: rgba(26,115,232,0.12); filter: blur(48px); animation: float 6s ease-in-out infinite;"></div>
        <div class="absolute bottom-1/4 -right-16 w-56 h-56 rounded-full pointer-events-none"
             style="background: rgba(91,158,247,0.15); filter: blur(40px); animation: float 8s ease-in-out infinite reverse;"></div>

        <div class="w-full max-w-sm page-enter">
          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 pulse-glow"
                 style="background: linear-gradient(135deg,#1a73e8,#5b9ef7); box-shadow: 0 12px 32px rgba(26,115,232,0.35);">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 14V26L20 36L4 26V14L20 4Z" fill="white" opacity="0.95"/>
                <path d="M20 10L30 16V24L20 30L10 24V16L20 10Z" fill="white" opacity="0.4"/>
              </svg>
            </div>
            <h1 class="text-3xl font-black mb-1" style="color:#1e2d5a;">FinanceFlow</h1>
            <p class="text-sm font-medium" style="color:#94a8c5;">Manage your money smarter</p>
          </div>

          <!-- Card -->
          <div class="glass-card p-6">
            <h2 class="text-xl font-bold mb-6" style="color:#1e2d5a;">Welcome back</h2>

            <!-- Username -->
            <div class="mb-4">
              <label class="text-xs font-semibold uppercase tracking-wider mb-2 block" style="color:#94a8c5;">Username</label>
              <div class="relative">
                <ion-icon name="person-outline"
                  class="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                  style="color:#1a73e8; font-size:18px;"></ion-icon>
                <input
                  type="text"
                  [value]="username()"
                  (input)="username.set($any($event.target).value)"
                  (change)="username.set($any($event.target).value)"
                  placeholder="emilys"
                  autocomplete="username"
                  class="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                  style="background:rgba(26,115,232,0.06); border:1.5px solid rgba(26,115,232,0.18); color:#1e2d5a;"
                  (focus)="onFocus($event)"
                  (blur)="onBlur($event)"
                  (keydown.enter)="onLogin()"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="mb-6">
              <label class="text-xs font-semibold uppercase tracking-wider mb-2 block" style="color:#94a8c5;">Password</label>
              <div class="relative">
                <ion-icon name="lock-closed-outline"
                  class="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                  style="color:#1a73e8; font-size:18px;"></ion-icon>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  [value]="password()"
                  (input)="password.set($any($event.target).value)"
                  (change)="password.set($any($event.target).value)"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="w-full pl-10 pr-10 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                  style="background:rgba(26,115,232,0.06); border:1.5px solid rgba(26,115,232,0.18); color:#1e2d5a;"
                  (focus)="onFocus($event)"
                  (blur)="onBlur($event)"
                  (keydown.enter)="onLogin()"
                />
                <button (click)="togglePassword()"
                  class="absolute right-3 top-1/2 -translate-y-1/2"
                  style="background:none; border:none; cursor:pointer; color:#94a8c5;">
                  <ion-icon [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'" style="font-size:18px;"></ion-icon>
                </button>
              </div>
            </div>

            <!-- Error -->
            @if (error()) {
              <div class="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                   style="background:rgba(244,67,54,0.08); border:1px solid rgba(244,67,54,0.25); color:#f44336;">
                {{ error() }}
              </div>
            }

            <!-- Sign In button -->
            <button
              (click)="onLogin()"
              [disabled]="loading() || !canSubmit()"
              class="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200"
              style="background:linear-gradient(135deg,#1a73e8,#5b9ef7); box-shadow:0 8px 24px rgba(26,115,232,0.35);"
              [style.opacity]="loading() || !canSubmit() ? '0.55' : '1'"
              [style.transform]="pressing() ? 'scale(0.97)' : 'scale(1)'"
              (mousedown)="pressing.set(true)"
              (mouseup)="pressing.set(false)"
              (mouseleave)="pressing.set(false)">
              @if (loading()) {
                <ion-spinner name="crescent" style="color:white; width:20px; height:20px;"></ion-spinner>
              } @else {
                Sign In
              }
            </button>

            <!-- Demo hint -->
            <p class="text-center text-xs mt-4 font-medium" style="color:#94a8c5;">
              Demo: <span class="font-mono font-bold" style="color:#1a73e8;">emilys</span> /
              <span class="font-mono font-bold" style="color:#1a73e8;">emilyspass</span>
            </p>
          </div>
        </div>
      </div>
    </ion-content>

    <style>
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-18px); }
      }
      input::placeholder { color: #b0c4d8; }
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
    el.style.borderColor = 'rgba(26,115,232,0.6)';
    el.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.12)';
  }

  onBlur(e: Event) {
    const el = e.target as HTMLElement;
    el.style.borderColor = 'rgba(26,115,232,0.18)';
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
