import { BcbClientOutPort } from '../ports/out/bcb-client.out-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';
import { SyncFxRatesUseCase } from './sync-fx-rates.usecase';

describe('SyncFxRatesUseCase', () => {
  it('should sync every configured FX indicator with its own catalog entry and quotes', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(async (entry) => `indicator-${entry.code}`),
      upsertObservations: jest.fn(
        async (_indicatorId, observations) => observations.length,
      ),
    };

    const bcbClient: jest.Mocked<BcbClientOutPort> = {
      fetchClosingQuotes: jest.fn(
        async (currency: string, _from: Date, _to: Date) => [
          { date: '2026-08-27', value: currency === 'USD' ? 5.4 : 6.0 },
          { date: '2026-08-28', value: currency === 'USD' ? 5.5 : 6.1 },
        ],
      ),
    };

    const useCase = new SyncFxRatesUseCase(indicatorRepository, bcbClient);

    const results = await useCase.execute();

    expect(indicatorRepository.upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'USD-BRL',
        source: 'BCB',
        frequency: 'DAILY',
      }),
    );
    expect(indicatorRepository.upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'EUR-BRL',
        source: 'BCB',
        frequency: 'DAILY',
      }),
    );

    expect(bcbClient.fetchClosingQuotes).toHaveBeenCalledWith(
      'USD',
      expect.any(Date),
      expect.any(Date),
    );
    expect(bcbClient.fetchClosingQuotes).toHaveBeenCalledWith(
      'EUR',
      expect.any(Date),
      expect.any(Date),
    );

    expect(indicatorRepository.upsertObservations).toHaveBeenCalledWith(
      'indicator-USD-BRL',
      [
        { date: '2026-08-27', value: 5.4 },
        { date: '2026-08-28', value: 5.5 },
      ],
    );

    expect(results).toEqual([
      { code: 'USD-BRL', observationsSynced: 2 },
      { code: 'EUR-BRL', observationsSynced: 2 },
    ]);
  });
});
