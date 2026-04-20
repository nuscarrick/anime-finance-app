import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  homeOutline,
  barChartOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="currency" href="/app/currency">
          <ion-icon name="cash-outline"></ion-icon>
          <ion-label>Currency</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="home" href="/app/home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="analytics" href="/app/analytics">
          <ion-icon name="bar-chart-outline"></ion-icon>
          <ion-label>Analytics</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsComponent {
  constructor() {
    addIcons({ cashOutline, homeOutline, barChartOutline });
  }
}
