export const IndicatorSource = {
  BCB: 'BCB',
  FRED: 'FRED',
} as const;

export type IndicatorSource =
  (typeof IndicatorSource)[keyof typeof IndicatorSource];
