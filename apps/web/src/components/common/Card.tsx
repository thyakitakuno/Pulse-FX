import Link from 'next/link';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  interactive?: boolean;
}

const baseClassName = 'rounded-xl border border-slate-200 bg-white shadow-sm';
const interactiveClassName =
  'no-underline transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md';

export function Card({
  children,
  className = '',
  href,
  interactive,
}: CardProps) {
  const isInteractive = interactive ?? Boolean(href);
  const classes = [baseClassName, isInteractive ? interactiveClassName : '', className]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
