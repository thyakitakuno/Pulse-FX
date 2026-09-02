import { IndicatorObservationResDTO } from './indicator-observation.res.dto';

export class IndicatorDetailResDTO {
  code: string;
  name: string;
  source: string;
  frequency: string;
  unit: string;
  description: string;
  limitations: string;
  lastValue: number | null;
  referenceDate: string | null;
  variationPercent: number | null;
  observations: IndicatorObservationResDTO[];
}
