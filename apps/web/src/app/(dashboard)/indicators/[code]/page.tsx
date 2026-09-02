import { IndicatorDetailView } from '@/features/indicator/components/IndicatorDetailView';

export default async function IndicatorDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return <IndicatorDetailView code={code} />;
}
