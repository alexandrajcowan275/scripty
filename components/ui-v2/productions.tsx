"use client";
import { SavedProductions } from "../saved-productions";
import { Brand } from "../ui/chrome";
import { Ambient, MotionLink } from "../ui/motion";
import { ProductionCard } from "../ui/production-card";
import { ProductionProvider, useProduction } from "./provider";

function ProductionCatalog() {
  const { data } = useProduction();
  return (
    <div className="v2-screen v2-productions">
      <Ambient warm />
      <div className="v2-page-wrap">
        <header className="v2-public-nav">
          <Brand />
          <MotionLink href="/new" kind="start" className="v2-button">
            Start a production →
          </MotionLink>
        </header>
        <main className="v2-production-catalog">
          <div className="v2-production-heading">
            <h1>Your productions.</h1>
            <p>Pick up where you left off.</p>
          </div>
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
