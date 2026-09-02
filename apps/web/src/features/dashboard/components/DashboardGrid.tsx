'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { Spinner } from '@/components/common/Spinner';
import { getDashboard, IndicatorSummary } from '@/features/dashboard/services/dashboard.service';
import { IndicatorCard } from './IndicatorCard';

export function DashboardGrid() {
  const [indicators, setIndicators] = useState<IndicatorSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDashboard()
      .then((data) => {
        if (isMounted) {
          setIndicators(data);
        }
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        if (err instanceof ApiError) {
          setError('Não foi possível carregar os indicadores.');
        } else {
          setError('Erro inesperado ao carregar os indicadores.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!indicators) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner />
        Carregando indicadores...
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.code} indicator={indicator} />
      ))}
    </div>
  );
}
