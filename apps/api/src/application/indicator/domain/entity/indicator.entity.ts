import { IndicatorFrequency } from '../../enums/indicator-frequency.enum';
import { IndicatorSource } from '../../enums/indicator-source.enum';

export interface Indicator {
  id: string;
  code: string;
  name: string;
  source: IndicatorSource;
  frequency: IndicatorFrequency;
  unit: string;
  description: string;
  limitations: string;
}
