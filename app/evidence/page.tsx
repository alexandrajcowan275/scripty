import type { Metadata } from "next";
import { EvidenceStory } from "@/components/public-site/v4/evidence";
export const metadata: Metadata = {
  title: "Scripty — Evidence",
  description:
    "Follow one real correction through 24 original frames and four recorded takes.",
};
export default function Page() {
  return <EvidenceStory />;
}
