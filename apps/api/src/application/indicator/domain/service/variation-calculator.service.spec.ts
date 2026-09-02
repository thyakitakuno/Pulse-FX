import { BadRequestException } from '@nestjs/common';
import { IndicatorFrequency } from '../../enums/indicator-frequency.enum';
import { VariationCalculatorService } from './variation-calculator.service';

describe('VariationCalculatorService', () => {
  let service: VariationCalculatorService;

  beforeEach(() => {
    service = new VariationCalculatorService();
  });

  it('should compare the last observation with the immediately previous one for a daily series', () => {
    const result = service.calculate(IndicatorFrequency.DAILY, [
      { date: '2026-08-27', value: 5.4 },
      { date: '2026-08-28', value: 5.5 },
    ]);

    expect(result.lastValue).toBe(5.5);
    expect(result.referenceDate).toBe('2026-08-28');
    expect(result.comparisonValue).toBe(5.4);
    expect(result.comparisonDate).toBe('2026-08-27');
    expect(result.variationPercent).toBeCloseTo(1.8518, 3);
  });

  it('should compare the last observation with the immediately previous one for a monthly series', () => {
    const result = service.calculate(IndicatorFrequency.MONTHLY, [
      { date: '2026-06-01', value: 5.25 },
      { date: '2026-07-01', value: 5.5 },
    ]);

    expect(result.variationPercent).toBeCloseTo(4.7619, 3);
  });

  it('should use the previous available observation regardless of the calendar gap between dates', () => {
    const result = service.calculate(IndicatorFrequency.DAILY, [
      { date: '2026-08-28', value: 5.4 }, // Friday
      { date: '2026-08-31', value: 5.5 }, // Monday — no interpolation for the weekend
    ]);

    expect(result.comparisonDate).toBe('2026-08-28');
    expect(result.variationPercent).toBeCloseTo(1.8518, 3);
  });

  it('should sort observations before comparing, regardless of input order', () => {
    const result = service.calculate(IndicatorFrequency.DAILY, [
      { date: '2026-08-28', value: 5.5 },
      { date: '2026-08-27', value: 5.4 },
    ]);

    expect(result.referenceDate).toBe('2026-08-28');
    expect(result.comparisonDate).toBe('2026-08-27');
  });

  it('should return a null variation when there is no previous observation to compare with', () => {
    const result = service.calculate(IndicatorFrequency.DAILY, [
      { date: '2026-08-28', value: 5.5 },
    ]);

    expect(result.lastValue).toBe(5.5);
    expect(result.comparisonValue).toBeNull();
    expect(result.variationPercent).toBeNull();
  });

  it('should return a null variation when the previous value is zero', () => {
    const result = service.calculate(IndicatorFrequency.DAILY, [
      { date: '2026-08-27', value: 0 },
      { date: '2026-08-28', value: 5.5 },
    ]);

    expect(result.variationPercent).toBeNull();
  });

  it('should throw when there are no observations at all', () => {
    expect(() => service.calculate(IndicatorFrequency.DAILY, [])).toThrow(
      BadRequestException,
    );
  });
});
