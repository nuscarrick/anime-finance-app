import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

// Root redirect: send authenticated users to /app/home, anonymous users to /login.
const rootRedirect = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree([auth.isLoggedIn() ? '/app/home' : '/login']);
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirect],
    children: [],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tabs/tabs.component').then((m) => m.TabsComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'currency',
        loadComponent: () =>
          import('./features/currency/currency.component').then(
            (m) => m.CurrencyComponent
          ),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.component').then(
            (m) => m.AnalyticsComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
