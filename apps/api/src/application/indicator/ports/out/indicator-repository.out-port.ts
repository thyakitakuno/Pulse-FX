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

export interface ObservationInput {
  date: string;
  value: number;
}

export interface IndicatorRepositoryOutPort {
  upsertCatalogEntry(entry: IndicatorCatalogEntry): Promise<string>;
  upsertObservations(
    indicatorId: string,
    observations: ObservationInput[],
  ): Promise<number>;
}
