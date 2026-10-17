"use client";
import { SavedProductions } from "../saved-productions";
import { AppPageHeader } from "../ui/app-shell";
import { Ambient, MotionLink } from "../ui/motion";
import { ProductionCard } from "../ui/production-card";
import { ProductionProvider, useProduction } from "./provider";

function ProductionCatalog() {
  const { data } = useProduction();
  return (
    <div className="v2-screen v2-productions">
      <Ambient warm />
      <AppPageHeader title="Productions" memoryRules={data?.rules} />
      <div className="v2-page-wrap">
        <main className="v2-production-catalog">
          <ul className="v2-production-grid" aria-label="Productions">
            <ProductionCard
              name={data?.project.name ?? "Mara"}
              image={
                data?.project.characters[0]?.referenceImageUrl ??
                "/mara/reference.jpg"
              }
              href="/p/mara"
              sample
            />
            <SavedProductions />
          </ul>
        </main>
      </div>
    </div>
  );
}
export function ProductionsScreen() {
  return (
    <ProductionProvider id="mara">
      <ProductionCatalog />
    </ProductionProvider>
  );
}
