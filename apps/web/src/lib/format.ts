export function formatIndicatorValue(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(
    value,
  );
}

export function formatIndicatorDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function formatVariationPercent(variationPercent: number): string {
  const sign = variationPercent > 0 ? '+' : '';
  return `${sign}${variationPercent.toFixed(2)}%`;
}
