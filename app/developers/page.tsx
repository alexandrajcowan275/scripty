import type { Metadata } from "next";
import { ApiStory } from "@/components/public-site/v4/api";
export const metadata: Metadata = {
  title: "Scripty — API",
  description:
    "Scene, correction, memory: explore Scripty’s API through static recorded examples.",
};
export default function Page() {
  return <ApiStory />;
}
