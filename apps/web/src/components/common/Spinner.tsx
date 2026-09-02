const toneClassName = {
  primary: 'border-slate-200 border-t-blue-700',
  white: 'border-white/30 border-t-white',
};

export function Spinner({
  className = '',
  tone = 'primary',
}: {
  className?: string;
  tone?: keyof typeof toneClassName;
}) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={`h-5 w-5 animate-spin rounded-full border-2 ${toneClassName[tone]} ${className}`}
    />
  );
}
