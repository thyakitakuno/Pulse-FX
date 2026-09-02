import { NotFoundException } from '@nestjs/common';
import { IndicatorRepositoryOutPort } from '../../indicator/ports/out/indicator-repository.out-port';
import { FavoriteRepositoryOutPort } from '../ports/out/favorite-repository.out-port';
import { AddFavoriteUseCase } from './add-favorite.usecase';

function createIndicatorRepository(
  overrides: Partial<jest.Mocked<IndicatorRepositoryOutPort>>,
): jest.Mocked<IndicatorRepositoryOutPort> {
  return {
    upsertCatalogEntry: jest.fn(),
    upsertObservations: jest.fn(),
    findAll: jest.fn(),
    findRecentObservations: jest.fn(),
    findLastSyncedAt: jest.fn(),
    findLatestObservationDate: jest.fn(),
    findByCode: jest.fn(async (_code: string) => null),
    ...overrides,
  };
}

describe('AddFavoriteUseCase', () => {
  it('should add a favorite using the resolved indicator id', async () => {
    const indicatorRepository = createIndicatorRepository({
      findByCode: jest.fn(async (_code: string) => ({
        id: 'ind-1',
        code: 'USD-BRL',
        name: 'Dólar americano (USD/BRL)',
        source: 'BCB' as const,
        frequency: 'DAILY' as const,
        unit: 'BRL',
        description: 'Taxa de câmbio de fechamento (PTAX).',
        limitations: 'Publicada apenas em dias úteis.',
      })),
    });
    const favoriteRepository: jest.Mocked<FavoriteRepositoryOutPort> = {
      add: jest.fn(),
      remove: jest.fn(),
      listIndicatorIdsByUser: jest.fn(),
    };

    const useCase = new AddFavoriteUseCase(
      indicatorRepository,
      favoriteRepository,
    );

    await useCase.execute('user-1', 'USD-BRL');

    expect(favoriteRepository.add).toHaveBeenCalledWith('user-1', 'ind-1');
  });

  it('should throw NotFoundException when the indicator code does not exist', async () => {
    const indicatorRepository = createIndicatorRepository({});
    const favoriteRepository: jest.Mocked<FavoriteRepositoryOutPort> = {
      add: jest.fn(),
      remove: jest.fn(),
      listIndicatorIdsByUser: jest.fn(),
    };

    const useCase = new AddFavoriteUseCase(
      indicatorRepository,
      favoriteRepository,
    );

    await expect(useCase.execute('user-1', 'UNKNOWN')).rejects.toThrow(
      NotFoundException,
    );
    expect(favoriteRepository.add).not.toHaveBeenCalled();
  });
});
