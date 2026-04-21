# FinanceFlow — Angular + Ionic + Tailwind

Modern 3-screen finance app built for the Angular Developer Test.

**Live demo:** https://anime-finance-app.vercel.app/

**Demo credentials** (dummyjson.com):
- Username: `emilys`
- Password: `emilyspass`

---

## Stack

- **Angular 21** — standalone components, zoneless change detection, signals
- **Ionic 8** (standalone API, iOS mode)
- **Tailwind CSS 3**
- **RxJS 7** with Signals interop
- **TypeScript 5.9** (strict mode)

## Features

### Screens
- **Login** — custom glassmorphism design, `dummyjson.com/auth/login`, JWT stored in localStorage
- **Home** (center tab) — user info, amount input, $1600 / $2100 value cards, vertical sliders that drive card amounts, Send Money CTA with toast
- **Currency** (left tab) — USD / EUR / GBP list with live-updating rates, bar chart, period-filtered sparkline (1D / 1W / 1M / 3M / 1Y)
- **Analytics** (right tab) — donut chart with interactive category tabs, animated entrance

### Angular requirements satisfied
- ✅ Standalone components (no NgModules)
- ✅ `signal` / `computed` / `effect` (slider state persisted via `effect()`)
- ✅ Signals ↔ RxJS interop (`toSignal`, `takeUntilDestroyed`)
- ✅ New control flow (`@if`, `@for`, `@defer`)
- ✅ Lazy loading via `loadComponent`
- ✅ **Zoneless change detection** (no zone.js polyfill) — `provideZonelessChangeDetection()`
- ✅ OnPush on all feature components

### Real-time behavior
Currency rates update every 3 seconds via `interval(3000)` piped through `takeUntilDestroyed()`. Chart and bars react automatically through computed signals.

### Animations
- Page slide-in (left/right/up)
- Donut chart sweep-in with staggered segment delay
- Bar chart grow-from-bottom (re-triggers on data tick)
- Menu pop-in spring
- Button press scale, pulse-glow CTA
- Skeleton shimmer (on `@defer` placeholder)

### Responsive
Layouts target 280px minimum width using min-width flex children, `truncate`, and `tabular-nums`.

---

## Local development

```bash
npm install
npm start            # http://localhost:4200
npm run build        # production build → dist/anime-finance-app/browser
```

## Project structure

```
src/app
├── core
│   ├── guards/             auth.guard.ts
│   ├── interceptors/       auth.interceptor.ts (Bearer token)
│   ├── models/             auth.model.ts, finance.model.ts
│   └── services/           auth.service.ts, finance.service.ts
├── features
│   ├── auth/               login.component
│   ├── home/               home.component  (middle)
│   ├── currency/           currency.component (left)
│   ├── analytics/          analytics.component (right)
│   └── tabs/               tabs.component
├── app.config.ts           zoneless + router + http + Ionic
└── app.routes.ts           auth-aware root redirect + lazy routes
```

## Deployment

Deployed to Vercel via `vercel.json` (SPA rewrites). GitHub Actions workflow also included for Pages fallback.
