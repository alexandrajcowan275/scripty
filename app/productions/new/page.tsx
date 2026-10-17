import type { Metadata } from "next";
export const metadata: Metadata = { title: "Scripty — New production" };
import { NewProduction } from "@/components/new-production";
export default function NewProductionPage() {
  return <NewProduction />;
}
