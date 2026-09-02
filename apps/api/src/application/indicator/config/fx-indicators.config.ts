export interface FxIndicatorConfig {
  code: string;
  name: string;
  currency: string;
  description: string;
  limitations: string;
}

export const FX_INDICATORS: FxIndicatorConfig[] = [
  {
    code: 'USD-BRL',
    name: 'Dólar americano (USD/BRL)',
    currency: 'USD',
    description:
      'Taxa de câmbio de fechamento (PTAX) entre o dólar americano e o real.',
    limitations:
      'Publicada pelo Banco Central apenas em dias úteis. Feriados e fins de semana não têm cotação PTAX própria.',
  },
  {
    code: 'EUR-BRL',
    name: 'Euro (EUR/BRL)',
    currency: 'EUR',
    description: 'Taxa de câmbio de fechamento (PTAX) entre o euro e o real.',
    limitations:
      'Publicada pelo Banco Central apenas em dias úteis. Feriados e fins de semana não têm cotação PTAX própria.',
  },
];
