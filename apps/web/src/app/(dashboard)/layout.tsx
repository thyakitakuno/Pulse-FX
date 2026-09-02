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
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <h1 className="text-xl font-semibold text-slate-900">
              Pulse FX
            </h1>
            <LogoutButton />
          </div>
        </header>
        <main className="flex flex-col items-center gap-6 px-4 py-8">
          {children}
          <Disclaimer />
        </main>
      </div>
    </RequireAuth>
  );
}
