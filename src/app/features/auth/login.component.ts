import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ion-page' },
  imports: [IonContent, IonSpinner, IonIcon],
  templateUrl: './login.component.html',
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-18px); }
    }
    .login-field {
      background: rgba(26, 115, 232, 0.06);
      border: 1.5px solid rgba(26, 115, 232, 0.18);
      color: #1e2d5a;
    }
    .login-field::placeholder { color: #b0c4d8; }
  `],
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  pressing = signal(false);

  canSubmit = computed(() => this.username().length > 0 && this.password().length > 0);

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
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
