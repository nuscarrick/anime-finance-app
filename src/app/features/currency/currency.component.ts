import {
  Component,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUpOutline, trendingDownOutline } from 'ionicons/icons';
import { FinanceService } from '../../core/services/finance.service';
import { CurrencyRate } from '../../core/models/finance.model';

@Component({
  selector: 'app-currency',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, IonContent, IonIcon],
  templateUrl: './currency.component.html',
})
export class CurrencyComponent implements OnInit {
  finance = inject(FinanceService);
  route = inject(ActivatedRoute);

  currencies = this.finance.currencies;
  selected = signal<CurrencyRate>(this.finance.currencies()[0]);
  selectedPeriod = signal('1W');
  fromCard = signal<{ label: string; amount: number } | null>(null);

  periods = ['1D', '1W', '1M', '3M', '1Y'];

  chartLinePath = computed(() => this.buildLinePath(this.selected().chartData, 200, 60));
  chartFillPath = computed(() => this.buildFillPath(this.selected().chartData, 200, 60));

  constructor() {
    addIcons({ trendingUpOutline, trendingDownOutline });
  }

  ngOnInit() {
    const label = this.route.snapshot.queryParamMap.get('label');
    const amount = this.route.snapshot.queryParamMap.get('amount');
    if (label && amount) {
      this.fromCard.set({ label, amount: parseFloat(amount) });
    }
  }

  selectCurrency(c: CurrencyRate) {
    this.selected.set(c);
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

  miniSparkline(c: CurrencyRate): string {
    return this.buildLinePath(c.chartData, 60, 30);
  }

  private buildLinePath(data: number[], w: number, h: number): string {
    if (!data.length) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
      return x + ',' + y;
    });
    return 'M ' + pts.join(' L ');
  }

  private buildFillPath(data: number[], w: number, h: number): string {
    const line = this.buildLinePath(data, w, h);
    return line + ' L ' + w + ',' + h + ' L 0,' + h + ' Z';
  }
}
