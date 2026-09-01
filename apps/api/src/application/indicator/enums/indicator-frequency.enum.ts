export const IndicatorFrequency = {
  DAILY: 'DAILY',
  MONTHLY: 'MONTHLY',
} as const;

export type IndicatorFrequency =
  (typeof IndicatorFrequency)[keyof typeof IndicatorFrequency];
