import { ReactNode } from 'react';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { Disclaimer } from '@/components/common/Disclaimer';
import { LogoutButton } from '@/components/layout/LogoutButton';

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="page">
        <header className="app-header">
          <h1 className="page-title">Pulse FX</h1>
          <LogoutButton />
        </header>
        {children}
        <Disclaimer />
      </div>
    </RequireAuth>
  );
}
