import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/persistence/prisma.service';
import { Indicator } from '../domain/entity/indicator.entity';
import { Observation } from '../domain/entity/observation.entity';
import {
  IndicatorCatalogEntry,
  IndicatorRepositoryOutPort,
} from '../ports/out/indicator-repository.out-port';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class IndicatorRepository implements IndicatorRepositoryOutPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertCatalogEntry(entry: IndicatorCatalogEntry): Promise<string> {
    const record = await this.prisma.indicator.upsert({
      where: { code: entry.code },
      update: {
        name: entry.name,
        source: entry.source,
        frequency: entry.frequency,
        unit: entry.unit,
        description: entry.description,
        limitations: entry.limitations,
      },
      create: entry,
    });

    return record.id;
  }

  async upsertObservations(
    indicatorId: string,
    observations: Observation[],
  ): Promise<number> {
    let count = 0;

    for (const observation of observations) {
      await this.prisma.observation.upsert({
        where: {
          indicatorId_date: {
            indicatorId,
            date: new Date(observation.date),
          },
        },
        update: { value: observation.value },
        create: {
          indicatorId,
          date: new Date(observation.date),
          value: observation.value,
        },
      });
      count += 1;
    }

    return count;
  }

  async findAll(): Promise<Indicator[]> {
    const records = await this.prisma.indicator.findMany({
      orderBy: { code: 'asc' },
    });

    return records.map((record) => ({
      id: record.id,
      code: record.code,
      name: record.name,
      source: record.source,
      frequency: record.frequency,
      unit: record.unit,
    }));
  }

  async findRecentObservations(
    indicatorId: string,
    limit: number,
  ): Promise<Observation[]> {
    const records = await this.prisma.observation.findMany({
      where: { indicatorId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return records.map((record) => ({
      date: toDateOnly(record.date),
      value: record.value.toNumber(),
    }));
  }

  async findLastSyncedAt(code: string): Promise<Date | null> {
    const record = await this.prisma.indicator.findUnique({
      where: { code },
      select: { updatedAt: true },
    });

    return record?.updatedAt ?? null;
  }
}
