import { ConfigService } from '@nestjs/config';
import { SyncPolicyService } from '../domain/service/sync-policy.service';
import { FredClientOutPort } from '../ports/out/fred-client.out-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';
import { SyncMacroIndicatorsUseCase } from './sync-macro-indicators.usecase';

function createConfigService(ttlMinutes: number): ConfigService {
  return {
    get: jest.fn().mockReturnValue(ttlMinutes),
  } as unknown as ConfigService;
}

describe('SyncMacroIndicatorsUseCase', () => {
  it('should sync every configured macro indicator when none was synced before', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(async (entry) => `indicator-${entry.code}`),
      upsertObservations: jest.fn(
        async (_indicatorId: string, observations) => observations.length,
      ),
      findAll: jest.fn(async () => []),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [],
      ),
      findLastSyncedAt: jest.fn(async (_code: string) => null),
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
      new SyncPolicyService(),
      createConfigService(1440),
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
      { code: 'FEDFUNDS', status: 'synced', observationsSynced: 2 },
      { code: 'CPIAUCSL', status: 'synced', observationsSynced: 2 },
    ]);
  });

  it('should skip an indicator synced within the TTL window without calling the FRED client', async () => {
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

    const fredClient: jest.Mocked<FredClientOutPort> = {
      fetchObservations: jest.fn(
        async (_seriesId: string, _from: Date, _to: Date) => [],
      ),
    };

    const useCase = new SyncMacroIndicatorsUseCase(
      indicatorRepository,
      fredClient,
      new SyncPolicyService(),
      createConfigService(1440),
    );

    const results = await useCase.execute();

    expect(fredClient.fetchObservations).not.toHaveBeenCalled();
    expect(indicatorRepository.upsertCatalogEntry).not.toHaveBeenCalled();
    expect(results).toEqual([
      { code: 'FEDFUNDS', status: 'skipped', observationsSynced: 0 },
      { code: 'CPIAUCSL', status: 'skipped', observationsSynced: 0 },
    ]);
  });
});
