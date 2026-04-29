import {
  Component,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trendingUpOutline,
  trendingDownOutline,
  arrowBackOutline,
  logOutOutline,
  closeOutline,
  chevronDownOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';
import { CurrencyRate, Period } from '../../core/models/finance.model';
import { CHART, PLACEHOLDER } from '../../core/constants/ui.constants';

@Component({
  selector: 'app-currency',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ion-page' },
  imports: [DecimalPipe, IonContent, IonIcon],
  templateUrl: './currency.component.html',
})
export class CurrencyComponent {
  finance = inject(FinanceService);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);

  showMenu = signal(false);
  chartOpen = signal(true);

  readonly placeholder = PLACEHOLDER;

  currencies = this.finance.currencies;
  period = this.finance.period;
  selected = signal<CurrencyRate>(this.finance.currencies()[0]);
  fromCard = signal<{ label: string; amount: number } | null>(null);

  // Reactive query params — Ionic keeps tab components alive, so ngOnInit
  // fires only once. We need to pick up fresh card values on every nav.
  private queryParams = toSignal(this.route.queryParamMap);

  periods: Period[] = ['1D', '1W', '1M', '3M', '1Y'];

  // Per-currency bar colors (mockup uses a single blue palette — different
  // shades, not different hues).
  readonly barColors: Record<string, { light: string; dark: string }> = {
    USD: { light: '#16aafe', dark: '#109ffd' },
    EUR: { light: '#9bc1f5', dark: '#4a90e2' },
    GBP: { light: '#c7dffb', dark: '#6ea8e8' },
  };

  readonly chartYear = new Date().getFullYear();

  // Chart data sliced by period; re-keyed so animations can re-trigger.
  private chartData = computed<number[]>(() => {
    const map = this.finance.periodChartData();
    return map[this.selected().code] ?? [];
  });

  // Keys change on every data tick so @for re-creates DOM → bar animation re-runs.
  barKey = computed(() => `${this.period()}-${this.chartData().length}-${this.chartData().at(-1)}`);

  // Bars for the chart card: N buckets sampled from the selected currency's
  // chart data, normalized to a 0..1 height ratio for rendering, then grouped
  // into pairs of two so each pair renders as adjacent bars (matches mockup).
  readonly chartPairs = computed<Array<[number, number]>>(() => {
    const data = this.chartData();
    if (!data.length) return [];
    const N = CHART.bucketCount;
    const slice = data.slice(-N);
    const padding: number[] = Array(Math.max(0, N - slice.length)).fill(slice[0] ?? 0);
    const points = [...padding, ...slice];
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const heights = points.map((v) => 0.25 + ((v - min) / range) * 0.75);
    const pairs: Array<[number, number]> = [];
    for (let i = 0; i < heights.length; i += CHART.pairSize) {
      pairs.push([heights[i], heights[i + 1] ?? heights[i]]);
    }
    return pairs;
  });

  readonly maxBarHeightPx = CHART.maxBarHeightPx;

  toggleChart() {
    this.chartOpen.update((v) => !v);
  }

  constructor() {
    addIcons({
      trendingUpOutline,
      trendingDownOutline,
      arrowBackOutline,
      logOutOutline,
      closeOutline,
      chevronDownOutline,
    });

    effect(() => {
      const p = this.queryParams();
      if (!p) return;
      const label = p.get('label');
      const amount = p.get('amount');
      this.fromCard.set(
        label && amount ? { label, amount: parseFloat(amount) } : null
      );
    });
  }

  goBack() {
    this.location.back();
  }

  signOut() {
    this.auth.logout();
  }

  selectCurrency(c: CurrencyRate) {
    this.selected.set(c);
  }

  setPeriod(p: Period) {
    this.finance.setPeriod(p);
  }

  clearFromCard() {
    this.fromCard.set(null);
  }

  currencyFlag(code: string): string {
    const flags: Record<string, string> = { USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧' };
    return flags[code] ?? '💱';
  }

  currencyBg(code: string): string {
    const bgs: Record<string, string> = {
      USD: 'rgba(67, 233, 123, 0.15)',
      EUR: 'rgba(108, 99, 255, 0.15)',
      GBP: 'rgba(255, 101, 132, 0.15)',
    };
    return bgs[code] ?? 'rgba(108,99,255,0.15)';
  }

  // Bar heights keyed by currency code. Memoized via computed so the
  // max-scan runs once per periodChartData tick instead of once per
  // bar per change-detection pass.
  readonly barHeights = computed<Record<string, number>>(() => {
    const map = this.finance.periodChartData();
    const lasts: Array<readonly [string, number]> = Object.entries(map).map(
      ([code, data]) => [code, data.at(-1) ?? 1] as const,
    );
    const max = Math.max(...lasts.map(([, v]) => v)) || 1;
    return Object.fromEntries(
      lasts.map(([code, v]) => [code, Math.max(24, Math.round((v / max) * 96))]),
    );
  });

}
