import type { Metadata } from "next";
import { DashboardScreen } from "@/components/ui-v2/dashboard";

export const metadata: Metadata = { title: "Scripty — Your productions" };
export default function DashboardPage() {
  return <DashboardScreen />;
}
