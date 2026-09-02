'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { Spinner } from '@/components/common/Spinner';
import { IndicatorCard } from '@/features/dashboard/components/IndicatorCard';
import { IndicatorSummary } from '@/features/dashboard/services/dashboard.service';
import { getFavorites } from '@/features/favorites/services/favorites.service';

export function FavoritesGrid() {
  const [favorites, setFavorites] = useState<IndicatorSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getFavorites()
      .then((data) => {
        if (isMounted) {
          setFavorites(data);
        }
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        if (err instanceof ApiError) {
          setError('Não foi possível carregar seus favoritos.');
        } else {
          setError('Erro inesperado ao carregar os favoritos.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleToggleFavorite(code: string, isFavorite: boolean) {
    if (isFavorite) {
      return;
    }

    setFavorites(
      (prev) => prev?.filter((indicator) => indicator.code !== code) ?? prev,
    );
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!favorites) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner />
        Carregando favoritos...
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <p className="max-w-md text-center text-sm text-slate-500">
        Você ainda não favoritou nenhum indicador. Toque na estrela de um
        card no dashboard pra adicionar aqui.
      </p>
    );
  }

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
      {favorites.map((indicator) => (
        <IndicatorCard
          key={indicator.code}
          indicator={indicator}
          isFavorite
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  );
}
