"use client";

import { Brand, ErrorNotice } from "../ui/chrome";
import { Ambient, MotionLink } from "../ui/motion";
import { ProductionProvider, useProduction } from "./provider";
import { EnterReveal, LandingProductStory } from "../ui/landing-product-story";
import { CinematicHero } from "../ui/cinematic-hero";

function LandingContent() {
  const { data, error, refresh, loading } = useProduction();
  return (
    <div className="v2-screen v2-landing">
      <Ambient warm />
      <CinematicHero>
        <header className="v2-public-nav">
          <Brand href="/" light />
          <nav aria-label="Scripty">
            <a href="#how">How it works</a>
            <MotionLink href="/developers" kind="receipt">
              API
            </MotionLink>
            <MotionLink href="/p/mara/evidence" kind="evidence">
              Evidence
            </MotionLink>
            <MotionLink
              href="/dashboard"
              kind="mara"
              className="v2-button v2-small"
            >
              Open studio
            </MotionLink>
          </nav>
        </header>
      </CinematicHero>
      <div className="v2-page-wrap">
        <main>
          {error && (
            <ErrorNotice
              retry={() => {
                void refresh().catch(() => {});
              }}
            >
              {error}
            </ErrorNotice>
          )}
          {data ? (
            <LandingProductStory data={data} />
          ) : loading ? (
            <div
              className="v2-skeleton v2-product-loading"
              role="status"
              aria-label="Loading the real Mara Studio"
            />
          ) : null}
          <EnterReveal className="v2-landing-closing">
            <h2>Your next take has a memory.</h2>
            <MotionLink href="/new" kind="start" className="v2-button">
              Start a production →
            </MotionLink>
          </EnterReveal>
        </main>
        <footer className="v2-public-footer">
          <Brand href="/" />
          <span>Continuity. Now part of the crew.</span>
          <a href="/brand/CREDITS.md">Photo credits</a>
          <MotionLink href="/dashboard">Your productions →</MotionLink>
        </footer>
      </div>
    </div>
  );
}
export function LandingScreen() {
  return (
    <ProductionProvider id="mara">
      <LandingContent />
    </ProductionProvider>
  );
}
