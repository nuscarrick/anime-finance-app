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
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trendingUpOutline,
  trendingDownOutline,
  arrowForwardOutline,
  logOutOutline,
  refreshOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';
import { ValueCard } from '../../core/models/finance.model';
import { VerticalSliderComponent } from '../../shared/vertical-slider.component';

const SLIDER_MIN = 0;
const SLIDER_MAX = 2000;

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ion-page' },
  imports: [DecimalPipe, FormsModule, IonContent, IonIcon, VerticalSliderComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  auth = inject(AuthService);
  finance = inject(FinanceService);
  router = inject(Router);
  private toastCtrl = inject(ToastController);

  readonly SLIDER_MIN = SLIDER_MIN;
  readonly SLIDER_MAX = SLIDER_MAX;

  user = this.auth.user;
  cards = this.finance.cards;
  inputAmount = this.finance.inputAmount;
  totalBalance = this.finance.totalBalance;
  portfolioTrendPct = this.finance.portfolioTrendPct;

  private _tick = toSignal(interval(60_000).pipe(map(() => Date.now())));

  greeting = computed(() => {
    this._tick();
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  });

  showMenu = signal(false);
  scaleMarks = [2000, 1500, 1000, 500, 0];

  constructor() {
    addIcons({
      trendingUpOutline,
      trendingDownOutline,
      arrowForwardOutline,
      logOutOutline,
      refreshOutline,
    });
  }

  onSliderChange(cardId: string, value: number) {
    this.finance.setSliderValue(cardId, value);
  }

  onInputChange(event: Event) {
    this.finance.setInputAmount(+(event.target as HTMLInputElement).value);
  }

  navigateToCurrency(card: ValueCard) {
    this.router.navigate(['/app/currency'], {
      queryParams: {
        cardId: card.id,
        amount: card.amount,
        label: card.label,
      },
    });
  }

  async onTransfer() {
    const t = await this.toastCtrl.create({
      message: `Transferring $${this.inputAmount().toLocaleString()}…`,
      duration: 1800,
      position: 'top',
      cssClass: 'af-toast',
      icon: 'arrow-forward-outline',
    });
    await t.present();
  }

  resetSliders() {
    this.finance.resetSliders();
  }

  signOut() {
    this.auth.logout();
  }
}
