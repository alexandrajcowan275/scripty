import type { Metadata } from "next";
import { NewProductionScreen } from "@/components/ui-v2/new-production";
export const metadata: Metadata = { title: "Scripty — New production" };
export default function Page() { return <NewProductionScreen />; }
