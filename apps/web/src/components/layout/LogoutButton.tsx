'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/features/auth/services/auth.service';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/login');
    }
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
