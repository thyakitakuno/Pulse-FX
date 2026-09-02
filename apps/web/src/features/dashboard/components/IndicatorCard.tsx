import Link from 'next/link';
import { IndicatorSummary } from '@/features/dashboard/services/dashboard.service';
import { Card } from '@/components/common/Card';
import { VariationBadge } from '@/components/common/VariationBadge';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { formatIndicatorValue, formatIndicatorDate } from '@/lib/format';

interface IndicatorCardProps {
  indicator: IndicatorSummary;
  isFavorite: boolean;
  onToggleFavorite: (code: string, isFavorite: boolean) => void;
}

export function IndicatorCard({
  indicator,
  isFavorite,
  onToggleFavorite,
}: IndicatorCardProps) {
  const { code, name, unit, lastValue, referenceDate, variationPercent } =
    indicator;

  return (
    <Card interactive className="relative flex flex-col gap-2 p-5">
      <FavoriteButton
        code={code}
        isFavorite={isFavorite}
        onToggled={onToggleFavorite}
        className="absolute top-2 right-2"
      />
      <Link
        href={`/indicators/${code}`}
        className="flex flex-col gap-2 pr-6 no-underline"
      >
        <h2 className="text-sm font-medium text-slate-500">{name}</h2>
        {lastValue === null || referenceDate === null ? (
          <p className="text-sm text-slate-400">Sem dado disponível ainda.</p>
        ) : (
          <>
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {formatIndicatorValue(lastValue)}{' '}
              <span className="text-sm font-normal text-slate-400">
                {unit}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {formatIndicatorDate(referenceDate)}
            </p>
            {variationPercent !== null ? (
              <VariationBadge variationPercent={variationPercent} />
            ) : null}
          </>
        )}
      </Link>
    </Card>
  );
}
