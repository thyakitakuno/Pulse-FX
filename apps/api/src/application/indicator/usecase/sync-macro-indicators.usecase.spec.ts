import { FredClientOutPort } from '../ports/out/fred-client.out-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';
import { SyncMacroIndicatorsUseCase } from './sync-macro-indicators.usecase';

describe('SyncMacroIndicatorsUseCase', () => {
  it('should sync every configured macro indicator with its own catalog entry and observations', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(async (entry) => `indicator-${entry.code}`),
      upsertObservations: jest.fn(
        async (_indicatorId: string, observations) => observations.length,
      ),
      findAll: jest.fn(async () => []),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [],
      ),
    };

    const fredClient: jest.Mocked<FredClientOutPort> = {
      fetchObservations: jest.fn(
        async (seriesId: string, _from: Date, _to: Date) => [
          { date: '2026-06-01', value: seriesId === 'FEDFUNDS' ? 5.33 : 313.5 },
          { date: '2026-07-01', value: seriesId === 'FEDFUNDS' ? 5.08 : 314.2 },
        ],
      ),
    };

    const useCase = new SyncMacroIndicatorsUseCase(
      indicatorRepository,
      fredClient,
    );

    const results = await useCase.execute();

    expect(indicatorRepository.upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'FEDFUNDS',
        source: 'FRED',
        frequency: 'MONTHLY',
      }),
    );
    expect(indicatorRepository.upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'CPIAUCSL',
        source: 'FRED',
        frequency: 'MONTHLY',
      }),
    );

    expect(fredClient.fetchObservations).toHaveBeenCalledWith(
      'FEDFUNDS',
      expect.any(Date),
      expect.any(Date),
    );
    expect(fredClient.fetchObservations).toHaveBeenCalledWith(
      'CPIAUCSL',
      expect.any(Date),
      expect.any(Date),
    );

    expect(indicatorRepository.upsertObservations).toHaveBeenCalledWith(
      'indicator-FEDFUNDS',
      [
        { date: '2026-06-01', value: 5.33 },
        { date: '2026-07-01', value: 5.08 },
      ],
    );

    expect(results).toEqual([
      { code: 'FEDFUNDS', observationsSynced: 2 },
      { code: 'CPIAUCSL', observationsSynced: 2 },
    ]);
  });
});
