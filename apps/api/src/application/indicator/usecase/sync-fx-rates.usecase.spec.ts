import { ConfigService } from '@nestjs/config';
import { SyncPolicyService } from '../domain/service/sync-policy.service';
import { BcbClientOutPort } from '../ports/out/bcb-client.out-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';
import { SyncFxRatesUseCase } from './sync-fx-rates.usecase';

function createConfigService(ttlMinutes: number): ConfigService {
  return {
    get: jest.fn().mockReturnValue(ttlMinutes),
  } as unknown as ConfigService;
}

describe('SyncFxRatesUseCase', () => {
  it('should sync every configured FX indicator when none was synced before', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(async (entry) => `indicator-${entry.code}`),
      upsertObservations: jest.fn(
        async (_indicatorId, observations) => observations.length,
      ),
      findAll: jest.fn(async () => []),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [],
      ),
      findLastSyncedAt: jest.fn(async (_code: string) => null),
    };

    const bcbClient: jest.Mocked<BcbClientOutPort> = {
      fetchClosingQuotes: jest.fn(
        async (currency: string, _from: Date, _to: Date) => [
          { date: '2026-08-27', value: currency === 'USD' ? 5.4 : 6.0 },
          { date: '2026-08-28', value: currency === 'USD' ? 5.5 : 6.1 },
        ],
      ),
    };

    const useCase = new SyncFxRatesUseCase(
      indicatorRepository,
      bcbClient,
      new SyncPolicyService(),
      createConfigService(60),
    );

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
      { code: 'USD-BRL', status: 'synced', observationsSynced: 2 },
      { code: 'EUR-BRL', status: 'synced', observationsSynced: 2 },
    ]);
  });

  it('should skip an indicator synced within the TTL window without calling the BCB client', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(async (entry) => `indicator-${entry.code}`),
      upsertObservations: jest.fn(
        async (_indicatorId: string, _observations) => 0,
      ),
      findAll: jest.fn(async () => []),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [],
      ),
      findLastSyncedAt: jest.fn(async (_code: string) => new Date()),
    };

    const bcbClient: jest.Mocked<BcbClientOutPort> = {
      fetchClosingQuotes: jest.fn(
        async (_currency: string, _from: Date, _to: Date) => [],
      ),
    };

    const useCase = new SyncFxRatesUseCase(
      indicatorRepository,
      bcbClient,
      new SyncPolicyService(),
      createConfigService(60),
    );

    const results = await useCase.execute();

    expect(bcbClient.fetchClosingQuotes).not.toHaveBeenCalled();
    expect(indicatorRepository.upsertCatalogEntry).not.toHaveBeenCalled();
    expect(results).toEqual([
      { code: 'USD-BRL', status: 'skipped', observationsSynced: 0 },
      { code: 'EUR-BRL', status: 'skipped', observationsSynced: 0 },
    ]);
  });
});
