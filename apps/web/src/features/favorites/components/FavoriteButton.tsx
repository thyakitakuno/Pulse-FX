'use client';

import { MouseEvent, useState } from 'react';
import {
  addFavorite,
  removeFavorite,
} from '@/features/favorites/services/favorites.service';

interface FavoriteButtonProps {
  code: string;
  isFavorite: boolean;
  onToggled?: (code: string, isFavorite: boolean) => void;
  className?: string;
}

export function FavoriteButton({
  code,
  isFavorite,
  onToggled,
  className = '',
}: FavoriteButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isFavorite) {
        await removeFavorite(code);
        onToggled?.(code, false);
      } else {
        await addFavorite(code);
        onToggled?.(code, true);
      }
    } catch {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      aria-label={
        isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
      }
      className={`flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition-colors disabled:cursor-not-allowed ${
        isFavorite
          ? 'text-amber-500 hover:text-amber-600'
          : 'text-slate-300 hover:text-slate-400'
      } ${className}`}
    >
      {isFavorite ? '★' : '☆'}
    </button>
  );
}
