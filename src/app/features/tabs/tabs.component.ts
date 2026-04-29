import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  homeOutline,
  barChartOutline,
  shieldOutline,
  addOutline,
  settingsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon],
  templateUrl: './tabs.component.html',
})
export class TabsComponent {
  private router = inject(Router);

  constructor() {
    addIcons({
      cashOutline,
      homeOutline,
      barChartOutline,
      shieldOutline,
      addOutline,
      settingsOutline,
    });
  }

  goHome(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigateByUrl('/app/home');
  }
}
