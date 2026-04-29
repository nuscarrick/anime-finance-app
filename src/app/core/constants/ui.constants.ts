/**
 * UI-level constants. Keep here:
 *  - mockup placeholder copy ("Lorem ipsum…") so templates don't carry magic strings
 *  - magic numbers used across components (slider range, donut radius, chart bucket counts)
 *
 * Templates reach these via fields on the component class (e.g. `placeholder = PLACEHOLDER`).
 */

export const PLACEHOLDER = {
  inputAmount: 'Lorem ipsum',
  cardSubtitle: 'Lorem ipsum dolor',
  ctaLabel: 'Lorem Ipsum',
  chartTitle: 'Lorem ipsum 2021',
  analyticsSubtitle: 'Lorem ipsum dolor',
  /** Three labels reused by currency column headers, currency chart legend, analytics tabs. */
  triadLabels: ['Lorem', 'Ipsum', 'Dolor'] as ReadonlyArray<string>,
} as const;

/** Brand + login screen copy (English, single-locale). */
export const LOGIN_COPY = {
  brand: 'FinanceFlow',
  tagline: 'Manage your money smarter',
  cardTitle: 'Welcome back',
  usernameLabel: 'Username',
  usernamePlaceholder: 'emilys',
  passwordLabel: 'Password',
  passwordPlaceholder: '••••••••',
  submit: 'Sign In',
  demoLead: 'Demo:',
  demoUsername: 'emilys',
  demoPassword: 'emilyspass',
} as const;

export const SLIDER_RANGE = {
  min: 100,
  max: 2000,
  step: 10,
} as const;

/** Tick labels rendered on the slider scale (top → bottom). */
export const SLIDER_TICKS: ReadonlyArray<number> = [2000, 1500, 1000, 500, 100];

export const DONUT = {
  /** SVG circle radius (in viewBox units). */
  radius: 40,
  /** SVG viewBox edge length (square). */
  viewBox: 120,
  /** Stroke width drawn for each segment. */
  strokeWidth: 21,
  /** Rotation applied to the SVG so the largest segment lands top-left. */
  rotateDeg: -225,
} as const;

export const CHART = {
  /** Number of points sampled from the time series for the bar chart. */
  bucketCount: 12,
  /** Bars per displayed pair. */
  pairSize: 2,
  /** Tallest bar in pixels (heights are scaled 0..1 then multiplied by this). */
  maxBarHeightPx: 180,
} as const;

/** Timer durations + intervals used across the app (ms). */
export const TIMING = {
  /** Default toast duration (errors, info). */
  toastDurationMs: 2500,
  /** Transfer-confirmation toast on the Home CTA. */
  transferToastDurationMs: 1800,
  /** Currency rate refresh tick. */
  currencyRefreshIntervalMs: 3000,
  /** Home greeting recompute tick (morning/afternoon/evening). */
  greetingTickMs: 60_000,
} as const;
