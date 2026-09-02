import { VariationCalculatorService } from '../domain/service/variation-calculator.service';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';
import { GetIndicatorDetailUseCase } from './get-indicator-detail.usecase';

function createRepository(
  overrides: Partial<jest.Mocked<IndicatorRepositoryOutPort>>,
): jest.Mocked<IndicatorRepositoryOutPort> {
  return {
    upsertCatalogEntry: jest.fn(),
    upsertObservations: jest.fn(),
    findAll: jest.fn(),
    findRecentObservations: jest.fn(
      async (_indicatorId: string, _limit: number) => [],
    ),
    findLastSyncedAt: jest.fn(),
    findLatestObservationDate: jest.fn(),
    findByCode: jest.fn(async (_code: string) => null),
    ...overrides,
  };
}

describe('GetIndicatorDetailUseCase', () => {
  it('should return null when the indicator code does not exist', async () => {
    const repository = createRepository({
      findByCode: jest.fn(async (_code: string) => null),
    });
    const useCase = new GetIndicatorDetailUseCase(
      repository,
      new VariationCalculatorService(),
    );

    const result = await useCase.execute('UNKNOWN');

    expect(result).toBeNull();
    expect(repository.findRecentObservations).not.toHaveBeenCalled();
  });

  it('should return the history window, sorted ascending, plus the variation for a daily indicator', async () => {
    const repository = createRepository({
      findByCode: jest.fn(async (_code: string) => ({
        id: 'ind-1',
        code: 'USD-BRL',
        name: 'Dólar americano (USD/BRL)',
        source: 'BCB' as const,
        frequency: 'DAILY' as const,
        unit: 'BRL',
        description:
          'Taxa de câmbio de fechamento (PTAX) entre o dólar americano e o real.',
        limitations: 'Publicada pelo Banco Central apenas em dias úteis.',
      })),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [
          { date: '2026-08-28', value: 5.5 },
          { date: '2026-08-27', value: 5.4 },
        ],
      ),
    });

    const useCase = new GetIndicatorDetailUseCase(
      repository,
      new VariationCalculatorService(),
    );

    const result = await useCase.execute('USD-BRL');

    expect(repository.findRecentObservations).toHaveBeenCalledWith('ind-1', 30);
    expect(result).toEqual({
      code: 'USD-BRL',
      name: 'Dólar americano (USD/BRL)',
      source: 'BCB',
      frequency: 'DAILY',
      unit: 'BRL',
      description:
        'Taxa de câmbio de fechamento (PTAX) entre o dólar americano e o real.',
      limitations: 'Publicada pelo Banco Central apenas em dias úteis.',
      lastValue: 5.5,
      referenceDate: '2026-08-28',
      variationPercent: expect.closeTo(1.8518, 3),
      observations: [
        { date: '2026-08-27', value: 5.4 },
        { date: '2026-08-28', value: 5.5 },
      ],
    });
  });

  it('should use a 13-observation window for a monthly indicator', async () => {
    const repository = createRepository({
      findByCode: jest.fn(async (_code: string) => ({
        id: 'ind-2',
        code: 'FEDFUNDS',
        name: 'Taxa de juros dos EUA (Fed Funds Rate)',
        source: 'FRED' as const,
        frequency: 'MONTHLY' as const,
        unit: '%',
        description:
          'Média mensal da taxa efetiva de juros do Federal Reserve dos EUA.',
        limitations: 'Publicada com defasagem em relação ao mês de referência.',
      })),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [
          { date: '2026-06-01', value: 5.33 },
          { date: '2026-07-01', value: 5.08 },
        ],
      ),
    });

    const useCase = new GetIndicatorDetailUseCase(
      repository,
      new VariationCalculatorService(),
    );

    await useCase.execute('FEDFUNDS');

    expect(repository.findRecentObservations).toHaveBeenCalledWith('ind-2', 13);
  });

  it('should return nulls and an empty observations array when there is no data yet', async () => {
    const repository = createRepository({
      findByCode: jest.fn(async (_code: string) => ({
        id: 'ind-3',
        code: 'CPIAUCSL',
        name: 'Inflação ao consumidor dos EUA (CPI)',
        source: 'FRED' as const,
        frequency: 'MONTHLY' as const,
        unit: 'index 1982-1984=100',
        description: 'Índice de preços ao consumidor dos EUA.',
        limitations: 'Sujeito a revisões após a divulgação inicial.',
      })),
      findRecentObservations: jest.fn(
        async (_indicatorId: string, _limit: number) => [],
      ),
    });

    const useCase = new GetIndicatorDetailUseCase(
      repository,
      new VariationCalculatorService(),
    );

    const result = await useCase.execute('CPIAUCSL');

    expect(result).toEqual(
      expect.objectContaining({
        lastValue: null,
        referenceDate: null,
        variationPercent: null,
        observations: [],
      }),
    );
  });
});
