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
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';
import { CurrencyRate, Period } from '../../core/models/finance.model';

@Component({
  selector: 'app-currency',
  standalone: true,
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

  currencies = this.finance.currencies;
  period = this.finance.period;
  selected = signal<CurrencyRate>(this.finance.currencies()[0]);
  fromCard = signal<{ label: string; amount: number } | null>(null);

  // Reactive query params — Ionic keeps tab components alive, so ngOnInit
  // fires only once. We need to pick up fresh card values on every nav.
  private queryParams = toSignal(this.route.queryParamMap);

  periods: Period[] = ['1D', '1W', '1M', '3M', '1Y'];

  // Chart data sliced by period; re-keyed so animations can re-trigger.
  private chartData = computed<number[]>(() => {
    const map = this.finance.periodChartData();
    return map[this.selected().code] ?? [];
  });

  chartLinePath = computed(() => this.buildLinePath(this.chartData(), 200, 60));
  chartFillPath = computed(() => this.buildFillPath(this.chartData(), 200, 60));

  // Keys change on every data tick so @for re-creates DOM → bar animation re-runs.
  barKey = computed(() => `${this.period()}-${this.chartData().length}-${this.chartData().at(-1)}`);

  constructor() {
    addIcons({
      trendingUpOutline,
      trendingDownOutline,
      arrowBackOutline,
      logOutOutline,
      closeOutline,
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

  // Bar height derived from latest value in period window (keeps bars meaningful).
  barHeight(code: string): number {
    const data = this.finance.periodChartData()[code] ?? [];
    const last = data.at(-1) ?? 1;
    const max = Math.max(...Object.values(this.finance.periodChartData()).map((d) => d.at(-1) ?? 1));
    return Math.max(24, Math.round((last / max) * 96));
  }

  miniSparkline(c: CurrencyRate): string {
    return this.buildLinePath(c.chartData.slice(-12), 60, 30);
  }

  private buildLinePath(data: number[], w: number, h: number): string {
    if (!data.length) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * w;
      const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
      return `${x},${y}`;
    });
    return 'M ' + pts.join(' L ');
  }

  private buildFillPath(data: number[], w: number, h: number): string {
    const line = this.buildLinePath(data, w, h);
    if (!line) return '';
    return `${line} L ${w},${h} L 0,${h} Z`;
  }
}
