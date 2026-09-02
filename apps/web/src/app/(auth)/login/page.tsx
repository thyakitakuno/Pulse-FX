import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Pulse FX</h1>
      <LoginForm />
    </div>
  );
}
