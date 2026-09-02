export interface MacroIndicatorConfig {
  code: string;
  name: string;
  seriesId: string;
  unit: string;
  description: string;
  limitations: string;
}

export const MACRO_INDICATORS: MacroIndicatorConfig[] = [
  {
    code: 'FEDFUNDS',
    name: 'Taxa de juros dos EUA (Fed Funds Rate)',
    seriesId: 'FEDFUNDS',
    unit: '%',
    description:
      'Média mensal da taxa efetiva de juros do Federal Reserve dos EUA.',
    limitations:
      'Publicada pelo Federal Reserve com defasagem de algumas semanas em relação ao mês de referência.',
  },
  {
    code: 'CPIAUCSL',
    name: 'Inflação ao consumidor dos EUA (CPI)',
    seriesId: 'CPIAUCSL',
    unit: 'index 1982-1984=100',
    description:
      'Índice de preços ao consumidor dos EUA, não sazonalmente ajustado.',
    limitations:
      'Publicado com defasagem em relação ao mês de referência e sujeito a revisões após a divulgação inicial.',
  },
];
