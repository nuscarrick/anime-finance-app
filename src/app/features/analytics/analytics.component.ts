import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ion-page' },
  imports: [DecimalPipe, IonContent],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {
  finance = inject(FinanceService);
  analytics = this.finance.analytics;

  weeklyData = signal([
    { label: 'Mon', value: 120, active: false },
    { label: 'Tue', value: 85, active: false },
    { label: 'Wed', value: 200, active: false },
    { label: 'Thu', value: 160, active: false },
    { label: 'Fri', value: 240, active: false },
    { label: 'Sat', value: 320, active: true },
    { label: 'Sun', value: 180, active: false },
  ]);

  maxWeekly = computed(() => Math.max(...this.weeklyData().map((d) => d.value)));

  totalExpensePct = computed(() => {
    const a = this.analytics();
    return Math.round((a.totalExpense / a.totalIncome) * 100);
  });

  donutSegments = computed(() => {
    const circumference = 2 * Math.PI * 40;
    const categories = this.analytics().categories;
    let offset = 0;

    return categories.map((cat) => {
      const dash = (cat.percentage / 100) * circumference;
      const gap = circumference - dash;
      const seg = {
        color: cat.color,
        dash: dash + ' ' + gap,
        offset: -offset,
      };
      offset += dash;
      return seg;
    });
  });
}
