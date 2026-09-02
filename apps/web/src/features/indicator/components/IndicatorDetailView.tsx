'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api/client';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { VariationBadge } from '@/components/common/VariationBadge';
import { formatIndicatorValue, formatIndicatorDate } from '@/lib/format';
import {
  getIndicatorDetail,
  IndicatorDetail,
} from '@/features/indicator/services/indicator.service';

const backButtonClassName =
  'inline-flex w-fit items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50';

export function IndicatorDetailView({ code }: { code: string }) {
  const [detail, setDetail] = useState<IndicatorDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getIndicatorDetail(code)
      .then((data) => {
        if (isMounted) {
          setDetail(data);
        }
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        if (err instanceof ApiError && err.status === 404) {
          setError('Indicador não encontrado.');
        } else {
          setError('Não foi possível carregar o indicador.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <Link href="/dashboard" className={backButtonClassName}>
          ← Voltar
        </Link>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner />
        Carregando indicador...
      </div>
    );
  }

  const hasData = detail.lastValue !== null && detail.referenceDate !== null;
  const history = [...detail.observations].reverse();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <Link href="/dashboard" className={backButtonClassName}>
        ← Voltar
      </Link>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {detail.name}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{detail.description}</p>

        {hasData ? (
          <div className="mt-5 flex flex-col gap-1.5 border-t border-slate-100 pt-5">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {formatIndicatorValue(detail.lastValue as number)}{' '}
              <span className="text-sm font-normal text-slate-400">
                {detail.unit}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {formatIndicatorDate(detail.referenceDate as string)}
            </p>
            {detail.variationPercent !== null ? (
              <VariationBadge variationPercent={detail.variationPercent} />
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            Sem dado disponível ainda.
          </p>
        )}
      </Card>

      <div>
        <h3 className="mb-2 text-base font-semibold text-slate-900">
          Histórico
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">Sem histórico disponível.</p>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">
                    Data
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((observation) => (
                  <tr
                    key={observation.date}
                    className="border-t border-slate-100 odd:bg-white even:bg-slate-50/60"
                  >
                    <td className="px-4 py-2.5 text-slate-700">
                      {formatIndicatorDate(observation.date)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {formatIndicatorValue(observation.value)} {detail.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <p className="text-xs text-slate-400">{detail.limitations}</p>
    </div>
  );
}
