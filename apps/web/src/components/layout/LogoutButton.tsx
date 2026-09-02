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
    <button className="button-secondary" type="button" onClick={handleLogout}>
      Sair
    </button>
  );
}
