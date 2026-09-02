import { Inject, Injectable } from '@nestjs/common';
import { IndicatorSummaryResDTO } from '../../indicator/dto/response/indicator-summary.res.dto';
import {
  IndicatorSummaryBuilderService,
  RECENT_OBSERVATIONS_LIMIT,
} from '../../indicator/domain/service/indicator-summary-builder.service';
import { IndicatorRepositoryOutPort } from '../../indicator/ports/out/indicator-repository.out-port';
import { ListFavoritesInPort } from '../ports/in/list-favorites.in-port';
import { FavoriteRepositoryOutPort } from '../ports/out/favorite-repository.out-port';

@Injectable()
export class ListFavoritesUseCase implements ListFavoritesInPort {
  constructor(
    @Inject('IndicatorRepositoryOutPort')
    private readonly indicatorRepository: IndicatorRepositoryOutPort,
    @Inject('FavoriteRepositoryOutPort')
    private readonly favoriteRepository: FavoriteRepositoryOutPort,
    private readonly summaryBuilder: IndicatorSummaryBuilderService,
  ) {}

  async execute(userId: string): Promise<IndicatorSummaryResDTO[]> {
    const favoriteIndicatorIds =
      await this.favoriteRepository.listIndicatorIdsByUser(userId);
    if (favoriteIndicatorIds.length === 0) {
      return [];
    }

    const indicators = await this.indicatorRepository.findAll();
    const favoritedIndicators = indicators.filter((indicator) =>
      favoriteIndicatorIds.includes(indicator.id),
    );

    return Promise.all(
      favoritedIndicators.map(async (indicator) => {
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
