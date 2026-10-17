import { ReviewScreen } from "@/components/ui-v2/review";
export default async function Page({
  params,
}: {
  params: Promise<{ shotId: string }>;
}) {
  const { shotId } = await params;
  return <ReviewScreen shotId={shotId} />;
}
