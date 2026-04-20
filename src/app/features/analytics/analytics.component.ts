import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Location } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { settingsOutline, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ion-page' },
  imports: [DecimalPipe, IonContent, IonIcon],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {
  finance = inject(FinanceService);
  auth = inject(AuthService);
  location = inject(Location);

  user = this.auth.user;
  analytics = this.finance.analytics;

  selectedTab = signal(0);

  selectedCategory = computed(() => this.analytics().categories[this.selectedTab()] ?? this.analytics().categories[0]);

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

  constructor() {
    addIcons({ settingsOutline, arrowBackOutline });
  }

  goBack() { this.location.back(); }
}
