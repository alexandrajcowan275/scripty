import type { Metadata } from "next";
import { EvidenceScreen } from "@/components/ui-v2/evidence";
export const metadata: Metadata = { title: "Scripty — Evidence" };
export default function Page() {
  return <EvidenceScreen />;
}
