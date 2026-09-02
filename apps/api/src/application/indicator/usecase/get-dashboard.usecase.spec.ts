import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';
import { VariationCalculatorService } from '../domain/service/variation-calculator.service';
import { IndicatorSummaryBuilderService } from '../domain/service/indicator-summary-builder.service';
import { GetDashboardUseCase } from './get-dashboard.usecase';

function createSummaryBuilder(): IndicatorSummaryBuilderService {
  return new IndicatorSummaryBuilderService(new VariationCalculatorService());
}

describe('GetDashboardUseCase', () => {
  it('should return last value, reference date and variation for each indicator with data', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(),
      upsertObservations: jest.fn(),
      findLastSyncedAt: jest.fn(),
      findLatestObservationDate: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(async () => [
        {
          id: 'ind-1',
          code: 'USD-BRL',
          name: 'Dólar americano (USD/BRL)',
          source: 'BCB' as const,
          frequency: 'DAILY' as const,
          unit: 'BRL',
          description:
            'Taxa de câmbio de fechamento (PTAX) entre o dólar americano e o real.',
          limitations: 'Publicada pelo Banco Central apenas em dias úteis.',
        },
      ]),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [
          { date: '2026-08-27', value: 5.4 },
          { date: '2026-08-28', value: 5.5 },
        ],
      ),
    };

    const useCase = new GetDashboardUseCase(
      indicatorRepository,
      createSummaryBuilder(),
    );

    const result = await useCase.execute();

    expect(indicatorRepository.findRecentObservations).toHaveBeenCalledWith(
      'ind-1',
      5,
    );
    expect(result).toEqual([
      {
        code: 'USD-BRL',
        name: 'Dólar americano (USD/BRL)',
        source: 'BCB',
        frequency: 'DAILY',
        unit: 'BRL',
        lastValue: 5.5,
        referenceDate: '2026-08-28',
        variationPercent: expect.closeTo(1.8518, 3),
      },
    ]);
  });

  it('should return nulls instead of throwing when an indicator has no observations yet', async () => {
    const indicatorRepository: jest.Mocked<IndicatorRepositoryOutPort> = {
      upsertCatalogEntry: jest.fn(),
      upsertObservations: jest.fn(),
      findLastSyncedAt: jest.fn(),
      findLatestObservationDate: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(async () => [
        {
          id: 'ind-2',
          code: 'FEDFUNDS',
          name: 'Taxa de juros dos EUA (Fed Funds Rate)',
          source: 'FRED' as const,
          frequency: 'MONTHLY' as const,
          unit: '%',
          description:
            'Média mensal da taxa efetiva de juros do Federal Reserve dos EUA.',
          limitations:
            'Publicada pelo Federal Reserve com defasagem em relação ao mês de referência.',
        },
      ]),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [],
      ),
    };

    const useCase = new GetDashboardUseCase(
      indicatorRepository,
      createSummaryBuilder(),
    );

    const result = await useCase.execute();

    expect(result).toEqual([
      {
        code: 'FEDFUNDS',
        name: 'Taxa de juros dos EUA (Fed Funds Rate)',
        source: 'FRED',
        frequency: 'MONTHLY',
        unit: '%',
        lastValue: null,
        referenceDate: null,
        variationPercent: null,
      },
    ]);
  });
});
