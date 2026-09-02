import { Inject, Injectable } from '@nestjs/common';
import { IndicatorDetailResDTO } from '../dto/response/indicator-detail.res.dto';
import { VariationCalculatorService } from '../domain/service/variation-calculator.service';
import { IndicatorFrequency } from '../enums/indicator-frequency.enum';
import { GetIndicatorDetailInPort } from '../ports/in/get-indicator-detail.in-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';

const HISTORY_WINDOW: Record<IndicatorFrequency, number> = {
  [IndicatorFrequency.DAILY]: 30,
  [IndicatorFrequency.MONTHLY]: 13,
};

@Injectable()
export class GetIndicatorDetailUseCase implements GetIndicatorDetailInPort {
  constructor(
    @Inject('IndicatorRepositoryOutPort')
    private readonly indicatorRepository: IndicatorRepositoryOutPort,
    private readonly variationCalculator: VariationCalculatorService,
  ) {}

  async execute(code: string): Promise<IndicatorDetailResDTO | null> {
    const indicator = await this.indicatorRepository.findByCode(code);
    if (!indicator) {
      return null;
    }

    const observations = await this.indicatorRepository.findRecentObservations(
      indicator.id,
      HISTORY_WINDOW[indicator.frequency],
    );

    const base = {
      code: indicator.code,
      name: indicator.name,
      source: indicator.source,
      frequency: indicator.frequency,
      unit: indicator.unit,
      description: indicator.description,
      limitations: indicator.limitations,
    };

    if (observations.length === 0) {
      return {
        ...base,
        lastValue: null,
        referenceDate: null,
        variationPercent: null,
        observations: [],
      };
    }

    const variation = this.variationCalculator.calculate(
      indicator.frequency,
      observations,
    );
    const sortedObservations = [...observations].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return {
      ...base,
      lastValue: variation.lastValue,
      referenceDate: variation.referenceDate,
      variationPercent: variation.variationPercent,
      observations: sortedObservations,
    };
  }
}
