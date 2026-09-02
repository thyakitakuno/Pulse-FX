import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Pulse FX',
  description: 'Acompanhamento de câmbio e indicadores macroeconômicos.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
