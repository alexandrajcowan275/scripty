import type { Metadata } from "next";
import { ScriptyStudio } from "@/components/canon-studio";
import { archiveEvidence } from "@/components/demo-evidence";
import cache from "@/seed/cache/manifest.json";
export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; id?: string; start?: string }>;
}) {
  const params = await searchParams;
  return (
    <ScriptyStudio
      key={params.id ?? "mara"}
      productionId={params.id ?? "mara"}
      startOnReady={params.start === "1"}
      archive={
        !params.id || params.id === "mara"
          ? archiveEvidence(cache.batches)
          : undefined
      }
      initialEvidence={params.view === "evidence" || params.view === "progress"}
    />
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; view?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return {
    title:
      params.id && params.id !== "mara"
        ? "Scripty — Production"
        : `Mara — Sample production · ${params.view === "progress" || params.view === "evidence" ? "Progress" : "Shots"}`,
  };
}
