import type { Metadata } from "next";
import { EvalScreen } from "@/components/ui-v2/eval";
export const metadata: Metadata = { title: "Scripty — Blind eval" };
export default function Page() {
  return <EvalScreen />;
}
