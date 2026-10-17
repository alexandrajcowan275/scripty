"use client";

import { pendingReviewShots } from "../ui-v2/dashboard-data";
import { ShotImage } from "../shot-image";
import { MotionLink } from "./motion";
import { RecordedTime } from "./production-overview";
import {
  checkLabel,
  failedCheck,
  frameName,
  type ProductionData,
} from "../ui-v2/data";

export function HomeReviewQueue({
  productions,
  loading,
}: {
  productions: ProductionData[];
  loading: boolean;
}) {
  const queue = pendingReviewShots(productions);
  return (
    <section
      className="v2-home-section"
      aria-labelledby="needs-review-title"
      aria-busy={loading}
    >
      <div className="v2-dashboard-section-heading">
        <h2 id="needs-review-title">Needs review</h2>
      </div>
      <div className="v2-home-review-grid">
        {queue.map(({ data, shot }) => {
          const check = failedCheck(shot),
            href = `/p/${encodeURIComponent(data.project.id)}/shot/${encodeURIComponent(shot.id)}`;
          return (
            <article className="v2-home-review-card" key={shot.id}>
              <MotionLink
                href={href}
                className="v2-home-review-image"
                aria-label={`Review ${data.project.name}, ${frameName(shot, data)}`}
              >
                <ShotImage
                  src={shot.imageUrl}
                  alt={shot.scenePrompt}
                  variant="thumbnail"
                />
                <span className="v2-home-frame v2-mono">
                  {frameName(shot, data)}
                </span>
                <i className="v2-home-drift-corner" aria-hidden="true" />
              </MotionLink>
              <div className="v2-home-review-copy">
                <span className="v2-muted">{data.project.name}</span>
                <p>
                  {check
                    ? `${checkLabel(check.key, data)}: ${check.observed}. Expected ${check.expected}.`
                    : "Scripty flagged this shot for review."}
                </p>
                <MotionLink href={href} className="v2-button v2-small">
                  Review →
                </MotionLink>
              </div>
            </article>
          );
        })}
        {!queue.length && (
          <p
            className={
              loading
                ? "v2-skeleton v2-home-queue-loading"
                : "v2-dashboard-empty"
            }
          >
            {loading ? "" : "You’re all caught up."}
          </p>
        )}
      </div>
    </section>
  );
}

export function HomeRecentRules({
  productions,
  loading,
}: {
  productions: ProductionData[];
  loading: boolean;
}) {
  const rules = productions
    .flatMap((data) =>
      data.rules
        .filter((rule) => rule.source !== "seed")
        .map((rule) => ({ data, rule })),
    )
    .sort((a, b) => Date.parse(b.rule.createdAt) - Date.parse(a.rule.createdAt))
    .slice(0, 3);
  return (
    <section className="v2-home-section" aria-labelledby="recent-rules-title">
      <div className="v2-dashboard-section-heading">
        <h2 id="recent-rules-title">Recently learned</h2>
      </div>
      <div className="v2-home-rules">
        {rules.map(({ data, rule }) => (
          <MotionLink
            className="v2-home-rule"
            href={`/p/${encodeURIComponent(data.project.id)}`}
            key={rule.id}
          >
            <span className="v2-muted">{data.project.name}</span>
            <p>{rule.text}</p>
            <RecordedTime value={rule.createdAt} compact />
          </MotionLink>
        ))}
        {!rules.length && (
          <p className="v2-dashboard-empty">
            {loading
              ? "Opening memory…"
              : "Your next correction becomes a rule."}
          </p>
        )}
      </div>
    </section>
  );
}

export function HomeAgents({ productions }: { productions: ProductionData[] }) {
  const agents = [
    { name: "Continuity monitor", type: "check" },
    { name: "Memory", type: "rule_learned" },
    { name: "Generation", type: "generate" },
  ];
  const traces = productions
    .flatMap((data) => data.traces)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return (
    <section className="v2-home-section" aria-labelledby="agents-title">
      <div className="v2-dashboard-section-heading">
        <h2 id="agents-title">Agents</h2>
        <span>Live status unavailable</span>
      </div>
      <div className="v2-home-agents">
        {agents.map((agent) => (
          <article className="v2-home-agent" key={agent.type}>
            <div>
              <h3>{agent.name}</h3>
              <span className="v2-muted">Status —</span>
            </div>
            <p>
              Last recorded run{" "}
              <RecordedTime
                value={
                  traces.find((trace) => trace.type === agent.type)?.createdAt
                }
                compact
              />
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
