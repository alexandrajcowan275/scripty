"use client";

import { Brand, ErrorNotice } from "../ui/chrome";
import { Ambient, MotionLink, RevealHeadline } from "../ui/motion";
import {
  checkLabel,
  confidence,
  failedCheck,
  frameName,
  primaryRule,
  ruleReach,
  shotsFor,
  sortedBatches,
  unclear,
} from "./data";
import { ProductionProvider, useProduction } from "./provider";
import { ShotCard } from "../ui/shot-card";

function LandingContent() {
  const { data, error, refresh, loading } = useProduction();
  const batches = sortedBatches(data),
    first = batches[0],
    latest = batches.at(-1);
  const hero =
    data && (shotsFor(data, first?.id).find((s) => s.flagged) ?? data.shots[0]);
  const studioHref = first ? `/p/mara?take=${first.id}` : "/p/mara";
  const rule = data && primaryRule(data),
    reach = data && rule ? ruleReach(rule, data.shots) : null;
  return (
    <div className="v2-screen v2-landing">
      <Ambient warm />
      <div className="v2-page-wrap">
        <header className="v2-public-nav">
          <Brand href="/" />
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
        <main>
          <section className="v2-landing-intro">
            <MotionLink
              href="/p/mara/evidence"
              kind="evidence"
              className="v2-live-pill v2-mono"
            >
              <i className="v2-memory-dot" />
              {data
                ? `${data.shots.length} sample shots · ${reach ?? "—"} prompts and checks carried a rule`
                : "Opening the contact sheet…"}{" "}
              →
            </MotionLink>
            <RevealHeadline
              lead="Scripty remembers your story."
              continuation="Scarf. Scar. Ring. Every detail your AI forgets between shots, caught, corrected and carried forward."
            />
            <div className="v2-cta-row">
              <MotionLink
                href="/new"
                kind="start"
                className="v2-button v2-large"
              >
                Start a production →
              </MotionLink>
              <MotionLink
                href={studioHref}
                kind="mara"
                className="v2-button v2-light v2-large"
              >
                Watch it on Mara
              </MotionLink>
            </div>
          </section>
          {error && (
            <ErrorNotice
              retry={() => {
                void refresh().catch(() => {});
              }}
            >
              {error}
            </ErrorNotice>
          )}
          {data && hero ? (
            <section
              className="v2-landing-hero"
              aria-label="A real continuity check"
            >
              <ShotCard
                shot={hero}
                data={data}
                openTake
                imageVariant="review"
              />
              <aside className="v2-hero-checklist v2-glass">
                <div className="v2-rail-heading">
                  <span className="v2-label">
                    {frameName(hero, data)} · checked
                  </span>
                  <span className="v2-label v2-drift-text">
                    {failedCheck(hero) ? "Flagged" : "Checked"}
                  </span>
                </div>
                {hero.checks
                  .filter((c) => !c.key.startsWith("rule:"))
                  .map((check) => (
                    <div className="v2-hero-check" key={check.key}>
                      <span title={checkLabel(check.key, data)}>
                        {check.expected.replace(/^./, (letter) =>
                          letter.toUpperCase(),
                        )}
                      </span>
                      <span
                        className={`v2-mono ${unclear(check) ? "v2-muted" : !check.pass ? "v2-drift-text" : "v2-pass-text"}`}
                      >
                        {unclear(check) ? "?" : check.pass ? "✓" : "✕"}{" "}
                        {confidence(check.confidence)}
                      </span>
                    </div>
                  ))}
              </aside>
              {failedCheck(hero) && (
                <div className="v2-hero-drift v2-glass">
                  <i className="v2-drift-dot" />
                  {checkLabel(failedCheck(hero)!.key, data)} needs a second look
                  <span className="v2-mono">
                    {confidence(failedCheck(hero)!.confidence)}
                  </span>
                </div>
              )}
              {rule && (
                <div className="v2-hero-rule v2-glass">
                  <i className="v2-memory-dot" />
                  <div>
                    <strong>{rule.text}</strong>
                    <p className="v2-mono">
                      Carried into {reach ?? "—"} prompts and checks
                    </p>
                  </div>
                </div>
              )}
            </section>
          ) : loading ? (
            <div
              className="v2-skeleton v2-hero-skeleton"
              aria-label="Loading sample shot"
            />
          ) : null}
          <section id="how" className="v2-contact-story">
            <div>
              <span className="v2-label">The contact sheet</span>
              <h2>
                On a real set, the script supervisor circles what changed.{" "}
                <span>
                  Scripty checks every AI shot and carries your notes into the
                  next take.
                </span>
              </h2>
            </div>
            <div className="v2-shot-grid">
              {data &&
                shotsFor(data, latest?.id).map((shot, index) => (
                  <ShotCard
                    key={shot.id}
                    shot={shot}
                    data={data}
                    index={index}
                    openTake
                  />
                ))}
            </div>
          </section>
          <section className="v2-principles" aria-label="How Scripty works">
            {[
              {
                label: "01 · Catch",
                text: "Every detail checked on its own. Says ‘unclear’ instead of guessing.",
              },
              {
                label: "02 · Circle",
                text: "Reject with one note. It becomes a testable rule, merged instead of duplicated.",
              },
              {
                label: "03 · Carry",
                text: "Rules ride into every future prompt and check. Your canon travels.",
              },
            ].map((item) => (
              <div key={item.label}>
                <span className="v2-label">{item.label}</span>
                <h3>{item.text}</h3>
              </div>
            ))}
          </section>
        </main>
        <footer className="v2-public-footer">
          <Brand href="/" />
          <span>Continuity. Now part of the crew.</span>
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
