'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { Spinner } from '@/components/common/Spinner';
import { login } from '@/features/auth/services/auth.service';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Usuário ou senha inválidos.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-md"
      onSubmit={handleSubmit}
    >
      <div className="mb-4 flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm text-slate-500">
          Usuário
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          className="rounded-md border border-slate-200 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div className="mb-4 flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-slate-500">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="rounded-md border border-slate-200 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-3 py-2.5 text-base font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Spinner tone="white" className="h-4 w-4" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </button>
    </form>
  );
}
