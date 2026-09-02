export class IndicatorSummaryResDTO {
  code: string;
  name: string;
  source: string;
  frequency: string;
  unit: string;
  lastValue: number | null;
  referenceDate: string | null;
  variationPercent: number | null;
}
