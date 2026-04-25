import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FinanceService } from './finance.service';

function configure(): void {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
}

describe('FinanceService', () => {
  beforeEach(() => {
    localStorage.clear();
    configure();
  });

  it('seeds two initial cards', () => {
    const service = TestBed.inject(FinanceService);
    expect(service.cards().length).toBe(2);
  });

  it('totalBalance equals the sum of all card amounts', () => {
    const service = TestBed.inject(FinanceService);
    const expected = service.cards().reduce((s, c) => s + c.amount, 0);
    expect(service.totalBalance()).toBe(expected);
  });

  it('portfolioTrendPct is the rounded average of card trends', () => {
    const service = TestBed.inject(FinanceService);
    // Seed: card-1 up 4.2, card-2 up 2.8 → avg 3.5
    expect(service.portfolioTrendPct()).toBe(3.5);
  });

  it('setSliderValue overrides the matching card amount', () => {
    const service = TestBed.inject(FinanceService);
    service.setSliderValue('card-1', 999);
    const card1 = service.cards().find((c) => c.id === 'card-1');
    expect(card1?.amount).toBe(999);
  });

  it('totalBalance reacts to slider overrides', () => {
    const service = TestBed.inject(FinanceService);
    const baseline = service.totalBalance();
    service.setSliderValue('card-1', 0);
    service.setSliderValue('card-2', 0);
    expect(service.totalBalance()).toBe(0);
    expect(service.totalBalance()).not.toBe(baseline);
  });

  it('resetSliders clears all overrides back to seed values', () => {
    const service = TestBed.inject(FinanceService);
    service.setSliderValue('card-1', 50);
    service.resetSliders();
    expect(service.cards().find((c) => c.id === 'card-1')?.amount).toBe(1600);
  });

  it('periodChartData length respects the period bucket size', () => {
    const service = TestBed.inject(FinanceService);
    const bucketSizes: Record<string, number> = {
      '1D': 6,
      '1W': 10,
      '1M': 20,
      '3M': 40,
      '1Y': 60,
    };
    for (const [period, max] of Object.entries(bucketSizes)) {
      service.setPeriod(period as '1D' | '1W' | '1M' | '3M' | '1Y');
      const data = service.periodChartData();
      Object.values(data).forEach((arr) => {
        expect(arr.length).toBeLessThanOrEqual(max);
      });
    }
  });

  it('periodChartData maps include every currency code', () => {
    const service = TestBed.inject(FinanceService);
    const codes = service.currencies().map((c) => c.code);
    const data = service.periodChartData();
    codes.forEach((code) => expect(data[code]).toBeDefined());
  });

  it('clamps persisted slider values that fall outside the slider range', () => {
    // simulate corrupted persisted state from an earlier slider config
    localStorage.setItem(
      'af_slider_state',
      JSON.stringify({ 'card-1': 9999, 'card-2': -50 }),
    );
    const service = TestBed.inject(FinanceService);
    const card1 = service.cards().find((c) => c.id === 'card-1');
    const card2 = service.cards().find((c) => c.id === 'card-2');
    expect(card1?.amount).toBeLessThanOrEqual(2000);
    expect(card2?.amount).toBeGreaterThanOrEqual(0);
  });
});
