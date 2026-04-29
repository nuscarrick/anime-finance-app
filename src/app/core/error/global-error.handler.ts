import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastController } from '@ionic/angular/standalone';
import { TIMING } from '../constants/ui.constants';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private toastCtrl = inject(ToastController);

  handleError(err: unknown): void {
    console.error('[GlobalErrorHandler]', err);

    // HTTP failures are already surfaced by the error interceptor.
    if (err instanceof HttpErrorResponse) return;

    const message = this.extractMessage(err);
    this.showToast(message);
  }

  private extractMessage(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === 'string') return err;
    return 'Something went wrong.';
  }

  private showToast(message: string): void {
    void this.toastCtrl
      .create({
        message,
        duration: TIMING.toastDurationMs,
        position: 'top',
        color: 'danger',
      })
      .then((t) => t.present());
  }
}
