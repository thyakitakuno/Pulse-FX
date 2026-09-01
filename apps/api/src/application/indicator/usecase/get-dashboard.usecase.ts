import { Inject, Injectable } from '@nestjs/common';
import { IndicatorSummaryResDTO } from '../dto/response/indicator-summary.res.dto';
import { VariationCalculatorService } from '../domain/service/variation-calculator.service';
import { GetDashboardInPort } from '../ports/in/get-dashboard.in-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';

const RECENT_OBSERVATIONS_LIMIT = 5;

@Injectable()
export class GetDashboardUseCase implements GetDashboardInPort {
  constructor(
    @Inject('IndicatorRepositoryOutPort')
    private readonly indicatorRepository: IndicatorRepositoryOutPort,
    private readonly variationCalculator: VariationCalculatorService,
  ) {}

  async execute(): Promise<IndicatorSummaryResDTO[]> {
    const indicators = await this.indicatorRepository.findAll();

    return Promise.all(
      indicators.map(async (indicator) => {
        const observations =
          await this.indicatorRepository.findRecentObservations(
            indicator.id,
            RECENT_OBSERVATIONS_LIMIT,
          );

        if (observations.length === 0) {
          return {
            code: indicator.code,
            name: indicator.name,
            source: indicator.source,
            frequency: indicator.frequency,
            unit: indicator.unit,
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
          code: indicator.code,
          name: indicator.name,
          source: indicator.source,
          frequency: indicator.frequency,
          unit: indicator.unit,
          lastValue: variation.lastValue,
          referenceDate: variation.referenceDate,
          variationPercent: variation.variationPercent,
        };
      }),
    );
  }
}
