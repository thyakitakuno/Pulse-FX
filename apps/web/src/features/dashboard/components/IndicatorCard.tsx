import { IndicatorSummary } from '@/features/dashboard/services/dashboard.service';
import { Card } from '@/components/common/Card';
import { VariationBadge } from '@/components/common/VariationBadge';
import { formatIndicatorValue, formatIndicatorDate } from '@/lib/format';

export function IndicatorCard({
  indicator,
}: {
  indicator: IndicatorSummary;
}) {
  const { code, name, unit, lastValue, referenceDate, variationPercent } =
    indicator;

  if (lastValue === null || referenceDate === null) {
    return (
      <Card href={`/indicators/${code}`} className="flex flex-col gap-2 p-5">
        <h2 className="text-sm font-medium text-slate-500">{name}</h2>
        <p className="text-sm text-slate-400">Sem dado disponível ainda.</p>
      </Card>
    );
  }

  return (
    <Card href={`/indicators/${code}`} className="flex flex-col gap-2 p-5">
      <h2 className="text-sm font-medium text-slate-500">{name}</h2>
      <p className="text-3xl font-bold tracking-tight text-slate-900">
        {formatIndicatorValue(lastValue)}{' '}
        <span className="text-sm font-normal text-slate-400">{unit}</span>
      </p>
      <p className="text-xs text-slate-400">
        {formatIndicatorDate(referenceDate)}
      </p>
      {variationPercent !== null ? (
        <VariationBadge variationPercent={variationPercent} />
      ) : null}
    </Card>
  );
}
