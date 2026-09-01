import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/persistence/prisma.service';
import {
  IndicatorCatalogEntry,
  IndicatorRepositoryOutPort,
  ObservationInput,
} from '../ports/out/indicator-repository.out-port';

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
    observations: ObservationInput[],
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
}
