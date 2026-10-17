import type { Metadata } from "next";
export const metadata: Metadata = { title: "Scripty — New production" };
import { NewProductionScreen } from "@/components/ui-v2/new-production";
export default function NewProductionPage() {
  return <NewProductionScreen />;
}
