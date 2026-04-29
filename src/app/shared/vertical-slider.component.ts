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
 * Wide hit-area with a slim centered rail and a prominent circular thumb
 * that overflows horizontally — matches the reference design.
 */
@Component({
  selector: 'app-vertical-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vertical-slider.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .vslider-hit {
      position: relative;
      width: 100%;
      height: 100%;
      cursor: grab;
      touch-action: none;
      user-select: none;
      outline: none;
      display: flex;
      justify-content: center;
    }
    .vslider-hit:focus-visible .vslider-rail {
      box-shadow: 0 0 0 3px rgba(16, 159, 253, 0.25);
    }
    .vslider-hit:active { cursor: grabbing; }
    .vslider-rail {
      position: relative;
      width: 8px;
      height: 100%;
      border-radius: 999px;
      background: rgba(16, 159, 253, 0.12);
      border: 1px solid rgba(16, 159, 253, 0.18);
      box-shadow: inset 0 1px 3px rgba(16, 159, 253, 0.10);
      overflow: hidden;
    }
    .vslider-fill {
      position: absolute;
      left: 0; right: 0; bottom: 0;
      border-radius: 999px 999px 0 0;
      pointer-events: none;
      transition: height 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .vslider-hit[data-accent="blue"] .vslider-fill {
      background: linear-gradient(180deg, #16aafe, #109ffd);
    }
    .vslider-hit[data-accent="red"] .vslider-fill {
      background: linear-gradient(180deg, #ff7c6e, #f44336);
    }
    .vslider-thumb {
      position: absolute;
      left: 50%;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #109ffd, #16aafe);
      border: none;
      box-shadow: 0 3px 8px rgba(16, 159, 253, 0.5), 0 1px 2px rgba(0, 0, 0, 0.08);
      transform: translate(-50%, 50%);
      pointer-events: none;
      transition: transform 120ms, bottom 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .vslider-hit[data-accent="red"] .vslider-thumb {
      border-color: #f44336;
      box-shadow: 0 3px 8px rgba(244, 67, 54, 0.4), 0 1px 2px rgba(0, 0, 0, 0.08);
    }
    .vslider-thumb.is-dragging {
      transform: translate(-50%, 50%) scale(1.15);
      transition: transform 80ms;
    }
  `],
})
export class VerticalSliderComponent {
  value = input.required<number>();
  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);
  accent = input<Accent>('blue');
  ariaLabel = input<string>('Value');

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
