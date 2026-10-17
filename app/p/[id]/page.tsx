import { Suspense } from "react";
import { StudioScreen } from "@/components/ui-v2/studio";
export default function Page() {
  return (
    <Suspense
      fallback={<main className="v2-loading-page">Opening the set…</main>}
    >
      <StudioScreen />
    </Suspense>
  );
}
