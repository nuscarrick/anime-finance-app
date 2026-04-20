import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { IonContent, IonRange, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trendingUpOutline,
  trendingDownOutline,
  arrowForwardOutline,
  logOutOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ion-page' },
  imports: [DecimalPipe, FormsModule, IonContent, IonRange, IonIcon],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  auth = inject(AuthService);
  finance = inject(FinanceService);
  router = inject(Router);

  user = this.auth.user;
  cards = this.finance.cards;
  sliderValue = this.finance.sliderValue;
  inputAmount = this.finance.inputAmount;
  totalBalance = this.finance.totalBalance;

  private _tick = toSignal(interval(60000).pipe(map(() => Date.now())));

  greeting = computed(() => {
    this._tick();
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  });

  showMenu = signal(false);
  slider1 = signal(1600);
  slider2 = signal(2100);
  scaleMarks = [2000, 1500, 1000, 500, 100];

  monthlyData = signal([
    { label: 'J', value: 60, active: false },
    { label: 'F', value: 45, active: false },
    { label: 'M', value: 75, active: false },
    { label: 'A', value: 55, active: false },
    { label: 'M', value: 80, active: false },
    { label: 'J', value: 65, active: false },
    { label: 'J', value: 90, active: true },
    { label: 'A', value: 70, active: false },
    { label: 'S', value: 85, active: false },
    { label: 'O', value: 60, active: false },
    { label: 'N', value: 75, active: false },
    { label: 'D', value: 95, active: false },
  ]);

  constructor() {
    addIcons({ trendingUpOutline, trendingDownOutline, arrowForwardOutline, logOutOutline });
  }

  onSliderChange(event: CustomEvent) {
    this.finance.setSliderValue(event.detail.value as number);
  }

  navigateToCurrency(card: { id: string; label: string; amount: number }) {
    this.router.navigate(['/app/currency'], {
      queryParams: { cardId: card.id, amount: card.amount, label: card.label },
    });
  }

  onTransfer() {
    alert('trigger CTA');
  }

  signOut() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
