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
import { settingsOutline, chevronBackOutline } from 'ionicons/icons';
import { FinanceService } from '../../core/services/finance.service';
import { DONUT, PLACEHOLDER } from '../../core/constants/ui.constants';

interface DonutSegment {
  color: string;
  dash: string;
  offset: number;
}

@Component({
  selector: 'app-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ion-page' },
  imports: [DecimalPipe, IonContent, IonIcon],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {
  finance = inject(FinanceService);
  location = inject(Location);

  analytics = this.finance.analytics;
  selectedTab = signal(1);

  readonly placeholder = PLACEHOLDER;
  readonly tabLabels = PLACEHOLDER.triadLabels;

  selectedCategory = computed(
    () =>
      this.analytics().categories[this.selectedTab()] ??
      this.analytics().categories[0]
  );

  donutCenterPct = computed(() => this.selectedCategory().percentage);

  readonly DONUT_RADIUS = DONUT.radius;
  readonly DONUT_VIEWBOX = DONUT.viewBox;
  readonly DONUT_STROKE_WIDTH = DONUT.strokeWidth;
  readonly DONUT_ROTATE_DEG = DONUT.rotateDeg;
  readonly DONUT_CIRCUMFERENCE = 2 * Math.PI * this.DONUT_RADIUS;
  readonly donutViewBox = `0 0 ${this.DONUT_VIEWBOX} ${this.DONUT_VIEWBOX}`;
  readonly donutCenter = this.DONUT_VIEWBOX / 2;
  readonly donutSvgTransform = `rotate(${this.DONUT_ROTATE_DEG}deg)`;

  // Geometry-only. Does not depend on selectedTab, so clicking category
  // tabs never recomputes the list or retriggers the CSS sweep.
  donutSegments = computed<DonutSegment[]>(() => {
    const c = this.DONUT_CIRCUMFERENCE;
    let offset = 0;
    return this.analytics().categories.map((cat) => {
      const dash = (cat.percentage / 100) * c;
      const seg: DonutSegment = {
        color: cat.color,
        dash: `${dash} ${c - dash}`,
        offset: -offset,
      };
      offset += dash;
      return seg;
    });
  });

  constructor() {
    addIcons({ settingsOutline, chevronBackOutline });
  }

  goBack() {
    this.location.back();
  }
}
