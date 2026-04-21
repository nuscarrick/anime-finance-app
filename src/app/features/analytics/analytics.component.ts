import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { DecimalPipe, Location } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { settingsOutline, arrowBackOutline } from 'ionicons/icons';
import { FinanceService } from '../../core/services/finance.service';

interface DonutSegment {
  color: string;
  dash: string;
  offset: number;
  selected: boolean;
}

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
  location = inject(Location);

  analytics = this.finance.analytics;
  selectedTab = signal(0);

  selectedCategory = computed(
    () =>
      this.analytics().categories[this.selectedTab()] ??
      this.analytics().categories[0]
  );

  // Donut center shows the selected category share, matching the ring.
  donutCenterPct = computed(() => this.selectedCategory().percentage);

  readonly DONUT_RADIUS = 40;
  readonly DONUT_CIRCUMFERENCE = 2 * Math.PI * this.DONUT_RADIUS;

  donutSegments = computed<DonutSegment[]>(() => {
    const c = this.DONUT_CIRCUMFERENCE;
    const categories = this.analytics().categories;
    const selected = this.selectedTab();
    let offset = 0;
    return categories.map((cat, i) => {
      const dash = (cat.percentage / 100) * c;
      const seg: DonutSegment = {
        color: cat.color,
        dash: `${dash} ${c - dash}`,
        offset: -offset,
        selected: i === selected,
      };
      offset += dash;
      return seg;
    });
  });

  constructor() {
    addIcons({ settingsOutline, arrowBackOutline });
  }

  goBack() {
    this.location.back();
  }
}
