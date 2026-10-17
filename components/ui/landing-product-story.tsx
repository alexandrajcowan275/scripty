"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ShotImage } from "../shot-image";
import { MotionLink } from "./motion";
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
  type ProductionData,
} from "../ui-v2/data";

const statement =
  "On a real set, the script supervisor catches what changed. Scripty does it for every AI shot, and remembers your corrections.";

export function EnterReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    element.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`v2-enter-reveal ${className}`}>
      {children}
    </div>
  );
}

/** Read-only product rendering: every shot, check and learned rule comes from the API. */
function ProductPreview({
  data,
  view = "check",
}: {
  data: ProductionData;
  view?: "check" | "correct" | "carry";
}) {
  const batches = sortedBatches(data),
    first = batches[0],
    latest = batches.at(-1);
  const initial = shotsFor(data, first?.id),
    shot = initial.find((candidate) => candidate.flagged) ?? initial[0],
    rule = primaryRule(data);
  const shots = view === "carry" ? shotsFor(data, latest?.id) : initial;
  return (
    <div
      className={`v2-product-preview v2-product-${view}`}
      role="img"
      aria-label={`${data.project.name} ${view === "correct" ? "Review" : view === "carry" ? "Memory" : "Studio"}: real saved shots and checks`}
    >
      <header className="v2-preview-top">
        <span>
          Scripty <span>/ {data.project.name}</span>
        </span>
        <strong>
          {view === "correct"
            ? "Review"
            : view === "carry"
              ? "Memory"
              : "Studio"}
        </strong>
        <span className="v2-preview-count">{shots.length} shots</span>
      </header>
      <div className="v2-preview-layout">
        <aside className="v2-preview-takes">
          <span>Takes</span>
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={
                (view === "carry" ? latest : first)?.id === batch.id ? "on" : ""
              }
            >
              Take {batch.index}
              <span>
                {Number.isFinite(batch.driftRate)
                  ? `${Math.round(batch.driftRate * 100)}%`
                  : "—"}
              </span>
            </div>
          ))}
        </aside>
        <div className="v2-preview-main">
          <div className="v2-preview-subtitle">
            {view === "correct"
              ? "One shot. One decision."
              : view === "carry"
                ? `Take ${latest?.index ?? "—"}`
                : `Take ${first?.index ?? "—"}`}
            <span>
              {view === "correct" && shot
                ? frameName(shot, data)
                : `${shots.filter((item) => item.flagged).length} flagged`}
            </span>
          </div>
          {view === "correct" && shot ? (
            <div className="v2-preview-review-image">
              <ShotImage src={shot.imageUrl} alt="" variant="thumbnail" />
              <span className="v2-preview-tag v2-mono">
                {frameName(shot, data)}
              </span>
              <span className="v2-preview-brackets" />
              {failedCheck(shot) && (
                <div className="v2-preview-finding">
                  {checkLabel(failedCheck(shot)!.key, data)} ·{" "}
                  {confidence(failedCheck(shot)!.confidence)}
                </div>
              )}
            </div>
          ) : (
            <div className="v2-preview-shots">
              {shots.map((item) => (
                <div className="v2-preview-shot" key={item.id}>
                  <ShotImage src={item.imageUrl} alt="" variant="thumbnail" />
                  <span className="v2-preview-tag v2-mono">
                    {frameName(item, data)}
                  </span>
                  {item.flagged && (
                    <>
                      <span className="v2-preview-drift">
                        {failedCheck(item)
                          ? checkLabel(failedCheck(item)!.key, data)
                          : "Flagged"}
                      </span>
                      <span className="v2-preview-brackets" />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {view === "correct" && shot && (
            <p className="v2-preview-note">
              {shot.rejectReason ??
                (failedCheck(shot)
                  ? `Keep ${failedCheck(shot)!.expected}.`
                  : "Review the character details.")}
            </p>
          )}
        </div>
        <aside className="v2-preview-inspector">
          <span>
            {view === "carry" ? "Scripty Memory" : "Attribute checks"}
          </span>
          {shot && view !== "carry" && (
            <div className="v2-preview-checklist">
              {shot.checks
                .filter((check) => !check.key.startsWith("rule:"))
                .map((check) => (
                  <div
                    className={`v2-preview-check ${!check.pass && !unclear(check) ? "drift" : ""}`}
                    key={check.key}
                  >
                    <span>{checkLabel(check.key, data)}</span>
                    <span>
                      {unclear(check) ? "?" : check.pass ? "✓" : "×"}{" "}
                      {confidence(check.confidence)}
                    </span>
                  </div>
                ))}
            </div>
          )}
          {rule && (
            <div className="v2-preview-memory">
              <span>Learned rule</span>
              <p>{rule.text}</p>
              <small>
                Carried into {ruleReach(rule, data.shots)} prompts and checks
              </small>
            </div>
          )}
          {view === "carry" && (
            <p className="v2-preview-note">Same character. New scenes.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

export function LandingProductStory({ data }: { data: ProductionData }) {
  return (
    <>
      <section
        id="product"
        className="v2-scroll-product"
        aria-label="The real Mara Studio contact sheet"
      >
        <div className="v2-product-pin">
          <div className="v2-scroll-card">
            <ProductPreview data={data} />
            <div className="v2-product-corners" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </section>
      <section className="v2-scroll-statement" aria-label={statement}>
        <h2 aria-hidden="true">
          {statement.split(" ").map((word, index) => (
            <span className="v2-statement-word" key={`${word}-${index}`}>
              {word}
              <span>{word}</span>{" "}
            </span>
          ))}
        </h2>
      </section>
      <section id="how" className="v2-scroll-how" aria-labelledby="how-title">
        <div className="v2-how-pin">
          <div className="v2-how-copy">
            <h2 id="how-title">A better next take.</h2>
            <ol>
              {[
                { title: "Check", text: "Catch the continuity slip." },
                { title: "Correct", text: "One note becomes a rule." },
                {
                  title: "Carry forward",
                  text: "Memory travels with the next take.",
                },
              ].map((step, index) => (
                <li
                  className={`v2-how-step v2-how-step-${index + 1}`}
                  key={step.title}
                >
                  <span>0{index + 1}</span>
                  <div>
                    <h3>
                      {step.title}
                      <span aria-hidden="true">{step.title}</span>
                    </h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <MotionLink href="/p/mara" kind="mara" className="v2-text-button">
              Explore the sample: Mara →
            </MotionLink>
          </div>
          <div className="v2-how-views">
            {(["check", "correct", "carry"] as const).map((view, index) => (
              <div
                className={`v2-how-view v2-how-view-${index + 1}`}
                key={view}
              >
                <ProductPreview data={data} view={view} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
