import { formatVariationPercent } from '@/lib/format';

type Tone = 'positive' | 'negative' | 'neutral';

const toneStyles: Record<Tone, string> = {
  positive: 'bg-emerald-50 text-emerald-700',
  negative: 'bg-red-50 text-red-700',
  neutral: 'bg-slate-100 text-slate-500',
};

const toneArrows: Record<Tone, string> = {
  positive: '▲',
  negative: '▼',
  neutral: '–',
};

function toneFor(variationPercent: number): Tone {
  if (variationPercent > 0) {
    return 'positive';
  }

  if (variationPercent < 0) {
    return 'negative';
  }

  return 'neutral';
}

export function VariationBadge({
  variationPercent,
}: {
  variationPercent: number;
}) {
  const tone = toneFor(variationPercent);

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${toneStyles[tone]}`}
    >
      <span aria-hidden="true">{toneArrows[tone]}</span>
      {formatVariationPercent(variationPercent)}
    </span>
  );
}
