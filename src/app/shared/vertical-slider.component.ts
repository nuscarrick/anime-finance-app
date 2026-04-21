import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';

type Accent = 'blue' | 'red';

/**
 * Pointer-driven vertical slider. Dragging up increases the value.
 * Uses Pointer Events (touch + mouse + pen in one API), setPointerCapture
 * so drags continue when the pointer leaves the track, and clamps to
 * [min, max] snapped to step.
 *
 * Chose a custom implementation over <input type=range> + rotate/writing-mode
 * because both have subtle hit-area or direction issues that make the
 * thumb jump unpredictably during drag.
 */
@Component({
  selector: 'app-vertical-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #track
      class="vslider-track"
      [attr.data-accent]="accent()"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
      role="slider"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value()"
      tabindex="0"
      (keydown.arrowup)="nudge(1, $event)"
      (keydown.arrowdown)="nudge(-1, $event)">
      <div class="vslider-fill" [style.height.%]="fillPct()"></div>
      <div class="vslider-thumb" [style.bottom.%]="fillPct()"
           [class.is-dragging]="dragging()"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .vslider-track {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 999px;
      background: rgba(26, 115, 232, 0.08);
      border: 1px solid rgba(26, 115, 232, 0.12);
      overflow: hidden;
      cursor: grab;
      touch-action: none;
      user-select: none;
      outline: none;
    }
    .vslider-track:focus-visible {
      box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.25);
    }
    .vslider-track:active { cursor: grabbing; }
    .vslider-fill {
      position: absolute;
      left: 0; right: 0; bottom: 0;
      border-radius: 999px 999px 0 0;
      pointer-events: none;
      transition: height 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .vslider-track[data-accent="blue"] .vslider-fill {
      background: linear-gradient(180deg, #5b9ef7, #1a73e8);
    }
    .vslider-track[data-accent="red"] .vslider-fill {
      background: linear-gradient(180deg, #ff7c6e, #f44336);
    }
    .vslider-thumb {
      position: absolute;
      left: 50%;
      width: 22px; height: 22px;
      border-radius: 50%;
      background: white;
      border: 3px solid #1a73e8;
      box-shadow: 0 2px 6px rgba(26, 115, 232, 0.4);
      transform: translate(-50%, 50%);
      pointer-events: none;
      transition: transform 120ms, bottom 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .vslider-track[data-accent="red"] .vslider-thumb {
      border-color: #f44336;
      box-shadow: 0 2px 6px rgba(244, 67, 54, 0.4);
    }
    .vslider-thumb.is-dragging {
      transform: translate(-50%, 50%) scale(1.15);
      transition: transform 80ms;
    }
  `],
})
export class VerticalSliderComponent {
  // Inputs
  value = input.required<number>();
  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);
  accent = input<Accent>('blue');
  ariaLabel = input<string>('Value');

  // Output
  valueChange = output<number>();

  private track = viewChild.required<ElementRef<HTMLDivElement>>('track');
  readonly dragging = signal(false);

  readonly fillPct = computed(() => {
    const v = this.clamp(this.value());
    const range = this.max() - this.min() || 1;
    return ((v - this.min()) / range) * 100;
  });

  onPointerDown(e: PointerEvent) {
    this.track().nativeElement.setPointerCapture(e.pointerId);
    this.dragging.set(true);
    this.updateFromEvent(e);
  }

  onPointerMove(e: PointerEvent) {
    if (!this.dragging()) return;
    this.updateFromEvent(e);
  }

  onPointerUp(e: PointerEvent) {
    if (this.dragging()) {
      this.track().nativeElement.releasePointerCapture(e.pointerId);
      this.dragging.set(false);
    }
  }

  nudge(direction: 1 | -1, e: Event) {
    e.preventDefault();
    const next = this.clamp(this.value() + direction * this.step());
    if (next !== this.value()) this.valueChange.emit(next);
  }

  private updateFromEvent(e: PointerEvent) {
    const rect = this.track().nativeElement.getBoundingClientRect();
    // Distance from bottom of track, clamped to [0, height].
    const y = Math.max(0, Math.min(rect.height, rect.bottom - e.clientY));
    const pct = rect.height === 0 ? 0 : y / rect.height;
    const raw = this.min() + pct * (this.max() - this.min());
    const snapped = this.snap(raw);
    if (snapped !== this.value()) this.valueChange.emit(snapped);
  }

  private clamp(v: number): number {
    return Math.max(this.min(), Math.min(this.max(), v));
  }

  private snap(v: number): number {
    const step = this.step() || 1;
    const snapped = Math.round((v - this.min()) / step) * step + this.min();
    return this.clamp(snapped);
  }
}
