"use client";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { InView } from "./motion";
import { percent } from "../ui-v2/data";
import { metricsVisible, type Evaluation } from "../ui-v2/evaluation";
export function Stat({
  label,
  value,
  children,
  memory = false,
}: {
  label: string;
  value: ReactNode;
  children?: ReactNode;
  memory?: boolean;
}) {
  return (
    <div className={`v2-stat ${memory ? "memory" : ""}`}>
      <span className="v2-label">{label}</span>
      <div className="v2-stat-value v2-mono">{value}</div>
      <div className="v2-stat-description">{children}</div>
    </div>
  );
}
export function ConfusionMatrix({
  evaluation,
  total,
  answered,
  updating = false,
}: {
  evaluation: Evaluation | null;
  total: number | null;
  answered: number | null;
  updating?: boolean;
}) {
  const matrix = evaluation?.confusionMatrix,
    value = (key: keyof NonNullable<typeof matrix>) => matrix?.[key] ?? "—";
  return (
    <section className={`v2-matrix-panel ${updating ? "updated" : ""}`}>
      <div className="v2-rail-heading">
        <h2 className="v2-label">Your labels vs monitor</h2>
        <span className="v2-mono">
          {answered ?? "—"} / {total ?? "—"}
        </span>
      </div>
      <progress
        max={total || 1}
        value={answered ?? 0}
        aria-label="Questions answered"
      />
      <div className="v2-matrix">
        <span />
        <span>you: drift</span>
        <span>you: ok</span>
        <span>flagged</span>
        <div className="caught">
          <strong>{value("truePositives")}</strong>caught
        </div>
        <div>
          <strong>{value("falsePositives")}</strong>false alarm
        </div>
        <span>passed</span>
        <div>
          <strong>{value("falseNegatives")}</strong>missed
        </div>
        <div className="correct">
          <strong>{value("trueNegatives")}</strong>correct
        </div>
      </div>
      <div className="v2-matrix-metrics">
        <Stat
          label="Precision"
          value={
            metricsVisible(evaluation) ? percent(evaluation?.precision) : "—"
          }
        />
        <Stat
          label="Recall"
          value={metricsVisible(evaluation) ? percent(evaluation?.recall) : "—"}
        />
      </div>
      <p className="v2-muted">
        Metrics after 20 judgments. Can’t tell is counted separately.
      </p>
      <p className="v2-mono v2-uncertain-count">
        {evaluation?.uncertainHumanLabels ?? "—"} can’t tell
      </p>
    </section>
  );
}

/** Animates only real returned values; missing data never becomes a numerical zero. */
export function CountUp({ value }: { value: number | null }) {
  const target = value !== null && Number.isFinite(value) ? value : null;
  const [display, setDisplay] = useState<number | null>(target);
  useEffect(() => {
    if (
      target === null ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    setDisplay(0);
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / 200);
      setDisplay(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return (
    <span
      aria-label={target === null ? "Unavailable" : String(target)}
      data-unavailable={target === null || undefined}
    >
      <span aria-hidden="true">{target === null ? "—" : (display ?? "—")}</span>
    </span>
  );
}
export function MemoryThreadDot({ order }: { order: number }) {
  return (
    <InView
      className="v2-memory-dot v2-thread-carry"
      style={{ "--thread-order": order } as CSSProperties}
    >
      {null}
    </InView>
  );
}
