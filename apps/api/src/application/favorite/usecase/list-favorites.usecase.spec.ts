import { VariationCalculatorService } from '../../indicator/domain/service/variation-calculator.service';
import { IndicatorSummaryBuilderService } from '../../indicator/domain/service/indicator-summary-builder.service';
import { IndicatorRepositoryOutPort } from '../../indicator/ports/out/indicator-repository.out-port';
import { FavoriteRepositoryOutPort } from '../ports/out/favorite-repository.out-port';
import { ListFavoritesUseCase } from './list-favorites.usecase';

function createSummaryBuilder(): IndicatorSummaryBuilderService {
  return new IndicatorSummaryBuilderService(new VariationCalculatorService());
}

describe('ListFavoritesUseCase', () => {
  it('should return an empty list when the user has no favorites', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(),
      upsertObservations: jest.fn(),
      findAll: jest.fn(),
      findRecentObservations: jest.fn(),
      findLastSyncedAt: jest.fn(),
      findLatestObservationDate: jest.fn(),
      findByCode: jest.fn(),
    };
    const favoriteRepository: jest.Mocked<FavoriteRepositoryOutPort> = {
      add: jest.fn(),
      remove: jest.fn(),
      listIndicatorIdsByUser: jest.fn(async (_userId: string) => []),
    };

    const useCase = new ListFavoritesUseCase(
      indicatorRepository,
      favoriteRepository,
      createSummaryBuilder(),
    );

    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
    expect(indicatorRepository.findAll).not.toHaveBeenCalled();
  });

  it('should return summaries only for the favorited indicators', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(),
      upsertObservations: jest.fn(),
      findAll: jest.fn(async () => [
        {
          id: 'ind-1',
          code: 'USD-BRL',
          name: 'Dólar americano (USD/BRL)',
          source: 'BCB' as const,
          frequency: 'DAILY' as const,
          unit: 'BRL',
          description: 'Taxa de câmbio de fechamento (PTAX).',
          limitations: 'Publicada apenas em dias úteis.',
        },
        {
          id: 'ind-2',
          code: 'EUR-BRL',
          name: 'Euro (EUR/BRL)',
          source: 'BCB' as const,
          frequency: 'DAILY' as const,
          unit: 'BRL',
          description: 'Taxa de câmbio de fechamento (PTAX).',
          limitations: 'Publicada apenas em dias úteis.',
        },
      ]),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [
          { date: '2026-08-27', value: 5.4 },
          { date: '2026-08-28', value: 5.5 },
        ],
      ),
      findLastSyncedAt: jest.fn(),
      findLatestObservationDate: jest.fn(),
      findByCode: jest.fn(),
    };
    const favoriteRepository: jest.Mocked<FavoriteRepositoryOutPort> = {
      add: jest.fn(),
      remove: jest.fn(),
      listIndicatorIdsByUser: jest.fn(async (_userId: string) => ['ind-1']),
    };

    const useCase = new ListFavoritesUseCase(
      indicatorRepository,
      favoriteRepository,
      createSummaryBuilder(),
    );

    const result = await useCase.execute('user-1');

    expect(indicatorRepository.findRecentObservations).toHaveBeenCalledTimes(1);
    expect(indicatorRepository.findRecentObservations).toHaveBeenCalledWith(
      'ind-1',
      5,
    );
    expect(result).toEqual([
      expect.objectContaining({ code: 'USD-BRL', lastValue: 5.5 }),
    ]);
  });
});
