import { Indicator } from '../../domain/entity/indicator.entity';
import { Observation } from '../../domain/entity/observation.entity';
import { IndicatorFrequency } from '../../enums/indicator-frequency.enum';
import { IndicatorSource } from '../../enums/indicator-source.enum';

export interface IndicatorCatalogEntry {
  code: string;
  name: string;
  source: IndicatorSource;
  frequency: IndicatorFrequency;
  unit: string;
  description: string;
  limitations: string;
}

export interface IndicatorRepositoryOutPort {
  upsertCatalogEntry(entry: IndicatorCatalogEntry): Promise<string>;
  upsertObservations(
    indicatorId: string,
    observations: Observation[],
  ): Promise<number>;
  findAll(): Promise<Indicator[]>;
  findByCode(code: string): Promise<Indicator | null>;
  findRecentObservations(
    indicatorId: string,
    limit: number,
  ): Promise<Observation[]>;
  findLastSyncedAt(code: string): Promise<Date | null>;
  findLatestObservationDate(code: string): Promise<Date | null>;
}
