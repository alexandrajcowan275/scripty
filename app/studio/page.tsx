import { ScriptyStudio } from "@/components/canon-studio";
import { archiveEvidence } from "@/components/demo-evidence";
import cache from "@/seed/cache/manifest.json";
export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  return (
    <ScriptyStudio
      archive={archiveEvidence(cache.batches)}
      initialEvidence={params.view === "evidence"}
    />
  );
}
