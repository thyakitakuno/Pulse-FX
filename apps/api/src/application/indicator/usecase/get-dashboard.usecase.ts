import { Inject, Injectable } from '@nestjs/common';
import { IndicatorSummaryResDTO } from '../dto/response/indicator-summary.res.dto';
import {
  IndicatorSummaryBuilderService,
  RECENT_OBSERVATIONS_LIMIT,
} from '../domain/service/indicator-summary-builder.service';
import { GetDashboardInPort } from '../ports/in/get-dashboard.in-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';

@Injectable()
export class GetDashboardUseCase implements GetDashboardInPort {
  constructor(
    @Inject('IndicatorRepositoryOutPort')
    private readonly indicatorRepository: IndicatorRepositoryOutPort,
    private readonly summaryBuilder: IndicatorSummaryBuilderService,
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

        return this.summaryBuilder.build(indicator, observations);
      }),
    );
  }
}
