import { Injectable } from '@nestjs/common';
import { IndicatorSummaryResDTO } from '../../dto/response/indicator-summary.res.dto';
import { Indicator } from '../entity/indicator.entity';
import { Observation } from '../entity/observation.entity';
import { VariationCalculatorService } from './variation-calculator.service';

export const RECENT_OBSERVATIONS_LIMIT = 5;

@Injectable()
export class IndicatorSummaryBuilderService {
  constructor(
    private readonly variationCalculator: VariationCalculatorService,
  ) {}

  build(
    indicator: Indicator,
    observations: Observation[],
  ): IndicatorSummaryResDTO {
    const base = {
      code: indicator.code,
      name: indicator.name,
      source: indicator.source,
      frequency: indicator.frequency,
      unit: indicator.unit,
    };

    if (observations.length === 0) {
      return {
        ...base,
        lastValue: null,
        referenceDate: null,
        variationPercent: null,
      };
    }

    const variation = this.variationCalculator.calculate(
      indicator.frequency,
      observations,
    );

    return {
      ...base,
      lastValue: variation.lastValue,
      referenceDate: variation.referenceDate,
      variationPercent: variation.variationPercent,
    };
  }
}
