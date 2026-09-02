'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { saveToken } from '@/lib/auth/token';
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
      const { accessToken } = await login(username, password);

      saveToken(accessToken);
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
    <form className="card" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="username">Usuário</label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
