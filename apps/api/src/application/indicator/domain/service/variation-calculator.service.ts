import { BadRequestException, Injectable } from '@nestjs/common';
import { IndicatorFrequency } from '../../enums/indicator-frequency.enum';

export interface IndicatorObservation {
  date: string;
  value: number;
}

export interface VariationResult {
  lastValue: number;
  referenceDate: string;
  comparisonValue: number | null;
  comparisonDate: string | null;
  variationPercent: number | null;
}

const PERIODS_BACK: Record<IndicatorFrequency, number> = {
  [IndicatorFrequency.DAILY]: 1,
  [IndicatorFrequency.MONTHLY]: 1,
};

@Injectable()
export class VariationCalculatorService {
  calculate(
    frequency: IndicatorFrequency,
    observations: IndicatorObservation[],
  ): VariationResult {
    if (observations.length === 0) {
      throw new BadRequestException(
        'Não há observações para calcular a variação',
      );
    }

    const sorted = [...observations].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const last = sorted[sorted.length - 1];

    const periodsBack = PERIODS_BACK[frequency];
    const comparisonIndex = sorted.length - 1 - periodsBack;
    const comparison = comparisonIndex >= 0 ? sorted[comparisonIndex] : null;

    return {
      lastValue: last.value,
      referenceDate: last.date,
      comparisonValue: comparison?.value ?? null,
      comparisonDate: comparison?.date ?? null,
      variationPercent: this.percentChange(last.value, comparison?.value),
    };
  }

  private percentChange(
    current: number,
    previous: number | undefined,
  ): number | null {
    if (previous === undefined || previous === 0) {
      return null;
    }

    return ((current - previous) / previous) * 100;
  }
}
