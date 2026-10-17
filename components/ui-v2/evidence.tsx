"use client";
import { AppPageHeader } from "../ui/app-shell";
import { useEffect, useState } from "react";
import { Nav, ErrorNotice } from "../ui/chrome";
import { Ambient, MotionLink, RevealHeadline } from "../ui/motion";
import { CountUp, MemoryThreadDot, Stat } from "../ui/metrics";
import matchedStudy from "@/seed/experiments/ab-test/summary.json";
import { ProductionDriftChart } from "../ui/production-overview";
import { ShotImage } from "../shot-image";
import {
  frameName,
  message,
  percent,
  request,
  primaryRule,
  ruleReach,
  shotsFor,
  sortedBatches,
} from "./data";
import { useProduction } from "./provider";
import { metricsVisible, type Evaluation } from "./evaluation";
export function EvidenceScreen() {
  const { id, data, error, loading, refresh } = useProduction();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  useEffect(() => {
    if (!data) return;
    let active = true;
    request<Evaluation>(`/api/eval?projectId=${encodeURIComponent(id)}`)
      .then((result) => {
        if (active) setEvaluation(result);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id, !!data]);
  const batches = sortedBatches(data),
    rule = data && primaryRule(data),
    reach = data && rule ? ruleReach(rule, data.shots) : null;
  const firstApplied =
    rule && data
      ? batches.find((batch) =>
          shotsFor(data, batch.id).some(
            (shot) =>
              shot.finalPrompt.includes(rule.text) ||
              shot.checks.some((check) => check.key === `rule:${rule.id}`),
          ),
        )
      : undefined;
  const eligible = firstApplied
    ? batches
        .filter((batch) => batch.index >= firstApplied.index)
        .reduce((count, batch) => count + shotsFor(data, batch.id).length, 0)
    : null;
  const studyA = matchedStudy.summary.A,
    studyB = matchedStudy.summary.B;
  const matchedRead =
    studyA.flaggedShots === studyB.flaggedShots && studyA.shots === studyB.shots
      ? `${studyA.flaggedShots}/${studyA.shots} flags in both arms`
      : `${studyA.flaggedShots}/${studyA.shots} vs ${studyB.flaggedShots}/${studyB.shots} flags`;
  return (
    <div className="v2-screen v2-workspace v2-evidence">
      <Ambient />
      <AppPageHeader
        title="Evidence"
        id={id}
        productionName={data?.project.name}
        memoryRules={data?.rules}
      />
      <main className="v2-detail-wrap">
        <h2 className="v2-section-title">Evidence</h2>
        {error && (
          <ErrorNotice
            retry={() => {
              void refresh().catch(() => {});
            }}
          >
            {error}
          </ErrorNotice>
        )}
        <div className="v2-stats">
          <Stat
            label="Rule reach"
            memory
            value={
              <>
                <CountUp value={reach ?? null} />
                {eligible !== null && (
                  <>
                    {" "}
                    / <CountUp value={eligible} />
                  </>
                )}
              </>
            }
          >
            Later prompts + checks carrying it
          </Stat>
          <Stat
            label="Shots checked"
            value={<CountUp value={data?.shots.length ?? null} />}
          >
            {data
              ? data.shots.reduce(
                  (total, shot) => total + shot.checks.length,
                  0,
                )
              : "—"}{" "}
            attribute checks
          </Stat>
          <Stat
            label="Blind labels"
            value={
              metricsVisible(evaluation) && evaluation
                ? `${evaluation.confusionMatrix.truePositives + evaluation.confusionMatrix.trueNegatives} / ${evaluation.evaluatedLabels}`
                : "—"
            }
          >
            <MotionLink href={`/p/${id}/eval`} kind="eval">
              Agreement with saved labels →
            </MotionLink>
          </Stat>
          <Stat
            label="Matched A/B flags"
            value={
              id === "mara" && matchedStudy.status === "completed"
                ? `${studyA.flaggedShots} vs ${studyB.flaggedShots}`
                : "—"
            }
          >
            {id === "mara" && matchedStudy.status === "completed"
              ? `${studyA.shots} / ${studyB.shots} shots · ${matchedStudy.humanVerified ? "human reviewed" : "human review pending"}`
              : "No matched run"}
          </Stat>
        </div>
        {loading ? (
          <div
            className="v2-skeleton v2-evidence-skeleton"
            aria-label="Loading memory thread"
          />
        ) : data && batches.length ? (
          <section className="v2-memory-thread">
            <header>
              <h2 className="v2-label">
                Memory thread{rule ? ` · ${rule.text}` : ""}
              </h2>
              <div className="v2-thread-legend">
                <span>
                  <i className="v2-memory-dot" />
                  rule carried
                </span>
                <span className="v2-drift-text">□ flagged</span>
                <span>✓ accepted look</span>
              </div>
            </header>
            {batches.map((batch) => {
              const shots = shotsFor(data, batch.id),
                previous = batches.find((b) => b.index === batch.index - 1),
                oldPrompts = shotsFor(data, previous?.id).map(
                  (s) => s.scenePrompt,
                ),
                changedScenes =
                  previous &&
                  shots.some((s, i) => s.scenePrompt !== oldPrompts[i]);
              const measured =
                shots.length &&
                shots.every((s) => s.checks.some((c) => c.confidence > 0));
              return (
                <div className="v2-thread-row" key={batch.id}>
                  <div>
                    <h3>
                      Take {batch.index}
                      {changedScenes ? " · new scenes" : ""}
                    </h3>
                    <p className="v2-mono">{batch.rulesApplied.length} rules</p>
                  </div>
                  <div className="v2-thread-cells">
                    {shots.map((shot, shotIndex) => {
                      const carries =
                          !!rule &&
                          shot.finalPrompt.includes(rule.text) &&
                          shot.checks.some((c) => c.key === `rule:${rule.id}`),
                        taught =
                          shot.status === "rejected" &&
                          data.traces.some(
                            (t) =>
                              t.shotId === shot.id && t.type === "rule_learned",
                          );
                      return (
                        <MotionLink
                          key={shot.id}
                          kind="shot"
                          href={`/p/${id}/shot/${shot.id}`}
                          className={`v2-thread-cell ${shot.flagged ? "flagged" : ""} ${shot.status === "accepted" ? "accepted" : ""} ${taught ? "taught" : ""}`}
                          title={`${frameName(shot, data)}: ${shot.flagged ? "flagged" : "not flagged"}${carries ? ", rule carried" : ""}`}
                        >
                          <ShotImage
                            src={shot.imageUrl}
                            variant="thumbnail"
                            alt={`${frameName(shot, data)} · ${shot.scenePrompt}`}
                          />
                          {carries && <MemoryThreadDot order={shotIndex} />}
                          {taught && (
                            <span className="v2-thread-badge">
                              taught a rule
                            </span>
                          )}
                          {shot.status === "accepted" && (
                            <span className="v2-thread-badge accepted">
                              accepted look
                            </span>
                          )}
                        </MotionLink>
                      );
                    })}
                    {!shots.length && (
                      <p className="v2-muted">
                        This take has no returned shots.
                      </p>
                    )}
                  </div>
                  <div className="v2-thread-rate">
                    <strong
                      className={`v2-mono ${batch.driftRate > 0 ? "v2-drift-text" : ""}`}
                    >
                      {measured ? percent(batch.driftRate) : "—"}
                    </strong>
                    <span className="v2-mono">
                      {shots.filter((s) => s.flagged).length}/{shots.length}{" "}
                      flagged
                    </span>
                  </div>
                </div>
              );
            })}
            <p className="v2-evidence-caveat">
              Scene and checker changes prevent a causal improvement claim.
              {id === "mara" && matchedStudy.status === "completed" && (
                <span className="v2-matched-note">
                  Matched test: {matchedRead}.{" "}
                  {matchedStudy.humanVerified
                    ? "Human-reviewed."
                    : "Human review pending."}
                </span>
              )}
            </p>
          </section>
        ) : (
          !loading &&
          data && (
            <section className="v2-empty-production">
              <h2>The story starts with a take.</h2>
              <MotionLink href={`/p/${id}`} className="v2-button">
                Open studio →
              </MotionLink>
            </section>
          )
        )}
        {data && id === "mara" && (
          <details className="v2-evidence-chart">
            <summary>Drift rate by take</summary>
            <ProductionDriftChart data={data} />
          </details>
        )}
      </main>
    </div>
  );
}
