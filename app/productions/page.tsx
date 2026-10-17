import type { Metadata } from "next";
import { ProductionsScreen } from "@/components/ui-v2/productions";
export const metadata: Metadata = { title: "Scripty — Your productions" };
export default function ProductionsPage() {
  return <ProductionsScreen />;
}
