'use client';

import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth/token';

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors hover:bg-slate-50"
    >
      Sair
    </button>
  );
}
