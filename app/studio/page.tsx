import { redirect } from "next/navigation";
import {
  legacyStudioTarget,
  type LegacyQuery,
} from "@/components/ui/legacy-route";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<LegacyQuery>;
}) {
  redirect(legacyStudioTarget(await searchParams));
}
