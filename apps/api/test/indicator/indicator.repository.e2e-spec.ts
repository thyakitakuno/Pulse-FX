import { ConfigService } from '@nestjs/config';
import { IndicatorFrequency } from '../../src/application/indicator/enums/indicator-frequency.enum';
import { IndicatorSource } from '../../src/application/indicator/enums/indicator-source.enum';
import { IndicatorRepository } from '../../src/application/indicator/repository/indicator.repository';
import { PrismaService } from '../../src/infra/persistence/prisma.service';

describe('IndicatorRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: IndicatorRepository;

  beforeAll(async () => {
    const configService = {
      get: () => process.env.DATABASE_URL,
    } as unknown as ConfigService;

    prisma = new PrismaService(configService);
    await prisma.$connect();
    repository = new IndicatorRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create an indicator on the first upsert and update the same row on the next one', async () => {
    const firstId = await repository.upsertCatalogEntry({
      code: 'TEST-DAILY',
      name: 'Test daily indicator',
      source: IndicatorSource.BCB,
      frequency: IndicatorFrequency.DAILY,
      unit: 'BRL',
      description: 'Fixture indicator used only by this test.',
      limitations: 'N/A.',
    });

    const secondId = await repository.upsertCatalogEntry({
      code: 'TEST-DAILY',
      name: 'Test daily indicator (updated)',
      source: IndicatorSource.BCB,
      frequency: IndicatorFrequency.DAILY,
      unit: 'BRL',
      description: 'Updated description.',
      limitations: 'N/A.',
    });

    expect(secondId).toBe(firstId);

    const indicator = await repository.findByCode('TEST-DAILY');
    expect(indicator?.name).toBe('Test daily indicator (updated)');
  });

  it('should upsert observations idempotently by (indicatorId, date)', async () => {
    const indicatorId = await repository.upsertCatalogEntry({
      code: 'TEST-DAILY',
      name: 'Test daily indicator',
      source: IndicatorSource.BCB,
      frequency: IndicatorFrequency.DAILY,
      unit: 'BRL',
      description: 'Fixture indicator used only by this test.',
      limitations: 'N/A.',
    });

    const firstCount = await repository.upsertObservations(indicatorId, [
      { date: '2026-01-05', value: 5.1 },
      { date: '2026-01-06', value: 5.2 },
    ]);
    expect(firstCount).toBe(2);

    const secondCount = await repository.upsertObservations(indicatorId, [
      { date: '2026-01-06', value: 5.25 },
      { date: '2026-01-07', value: 5.3 },
    ]);
    expect(secondCount).toBe(2);

    const observations = await repository.findRecentObservations(
      indicatorId,
      10,
    );
    expect(observations).toEqual([
      { date: '2026-01-07', value: 5.3 },
      { date: '2026-01-06', value: 5.25 },
      { date: '2026-01-05', value: 5.1 },
    ]);
  });

  it('should return the most recent persisted date via findLatestObservationDate', async () => {
    const indicatorId = await repository.upsertCatalogEntry({
      code: 'TEST-MONTHLY',
      name: 'Test monthly indicator',
      source: IndicatorSource.FRED,
      frequency: IndicatorFrequency.MONTHLY,
      unit: '%',
      description: 'Fixture indicator used only by this test.',
      limitations: 'N/A.',
    });

    expect(
      await repository.findLatestObservationDate('TEST-MONTHLY'),
    ).toBeNull();

    await repository.upsertObservations(indicatorId, [
      { date: '2026-01-01', value: 4.5 },
      { date: '2026-02-01', value: 4.6 },
    ]);

    const latestDate =
      await repository.findLatestObservationDate('TEST-MONTHLY');
    expect(latestDate?.toISOString().slice(0, 10)).toBe('2026-02-01');
  });

  it('should return null from findByCode, findLastSyncedAt and findLatestObservationDate when the code does not exist', async () => {
    expect(await repository.findByCode('UNKNOWN-CODE')).toBeNull();
    expect(await repository.findLastSyncedAt('UNKNOWN-CODE')).toBeNull();
    expect(
      await repository.findLatestObservationDate('UNKNOWN-CODE'),
    ).toBeNull();
  });

  it('should list every persisted indicator ordered by code via findAll', async () => {
    const indicators = await repository.findAll();
    const codes = indicators.map((indicator) => indicator.code);

    expect(codes).toEqual([...codes].sort());
    expect(codes).toEqual(
      expect.arrayContaining(['TEST-DAILY', 'TEST-MONTHLY']),
    );
  });
});
