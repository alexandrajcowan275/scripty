import type { Metadata } from "next";
import { PublicApiPage } from "@/components/public-site/api";
export const metadata: Metadata = { title: "Scripty — API" };
export default function Page() {
  return <PublicApiPage />;
}
