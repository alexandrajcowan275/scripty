"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { ShotImage } from "../shot-image";
import { MotionLink } from "./motion";
import { percent, sortedBatches, type ProductionData } from "../ui-v2/data";
import { lastProductionActivity, ringMilestone } from "../ui-v2/dashboard-data";

export function RecordedTime({
  value,
  compact = false,
}: {
  value?: string;
  compact?: boolean;
}) {
  if (!value || !Number.isFinite(Date.parse(value))) return <span>—</span>;
  const date = new Date(value);
  return (
    <time
      dateTime={value}
      title={date.toLocaleString("en-US", { timeZoneName: "short" })}
    >
      {date.toLocaleString(
        "en-US",
        compact
          ? {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }
          : {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            },
      )}
    </time>
  );
}

export function ProductionOverviewCard({
  data,
  name,
  id,
  createdAt,
  sample = false,
}: {
  data?: ProductionData;
  name: string;
  id: string;
  createdAt?: string;
  sample?: boolean;
}) {
  const image =
    data?.shots[0]?.imageUrl ??
    data?.project.characters[0]?.referenceImageUrl ??
    `/api/productions/${encodeURIComponent(id)}/reference`;
  const activity = data ? lastProductionActivity(data) : undefined;
  return (
    <MotionLink
      href={`/p/${encodeURIComponent(id)}`}
      kind={sample ? "mara" : "page"}
      className="v2-overview-card"
    >
      <div className="v2-overview-image" data-viewfinder>
        <ShotImage
          src={image}
          alt={`${name}, production reference`}
          variant="thumbnail"
          priority={sample}
        />
        {sample && <span className="v2-overview-tag">Sample production</span>}
        <span className="v2-overview-open" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="v2-overview-caption">
        <h3>{name}</h3>
        <p>
          {data
            ? `${data.batches.length} takes · ${data.shots.length} shots`
            : "— takes · — shots"}
        </p>
        <span className="v2-overview-date">
          {activity ? "Last activity " : "Created "}
          <RecordedTime value={activity ?? createdAt} />
        </span>
      </div>
    </MotionLink>
  );
}

export function ProductionDriftChart({ data }: { data: ProductionData }) {
  const gradientId = useId().replaceAll(":", ""),
    batches = sortedBatches(data),
    milestone = ringMilestone(data);
  const x = (position: number) =>
    48 + (position / Math.max(1, batches.length - 1)) * 832;
  const y = (rate: number) => 184 - Math.max(0, Math.min(1, rate)) * 136;
  const points = batches
    .filter((batch) => Number.isFinite(batch.driftRate))
    .map((batch) => ({
      batch,
      x: x(batches.indexOf(batch)),
      y: y(batch.driftRate),
    }));
  const line = points
    .map(
      (point, index) =>
        `${index ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
    )
    .join(" ");
  return (
    <div className="v2-drift-chart">
      <div className="v2-chart-heading">
        <div>
          <h2>Monitor flags per take</h2>
          <p>Mara · monitor-flagged shots</p>
        </div>
        <MotionLink
          href="/p/mara/evidence"
          kind="evidence"
          className="v2-text-button"
        >
          View evidence ↗
        </MotionLink>
      </div>
      {points.length ? (
        <>
          <svg
            viewBox="0 0 928 230"
            role="img"
            aria-label={`Mara drift rate: ${batches.map((batch) => `Take ${batch.index}, ${percent(batch.driftRate)}`).join("; ")}${milestone ? `. Ring rule first applied in Take ${batches[milestone.firstApplied].index}.` : ""}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="v2-chart-fill-top" />
                <stop offset="100%" className="v2-chart-fill-bottom" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((rate) => (
              <g key={rate}>
                <line
                  x1="48"
                  x2="880"
                  y1={y(rate)}
                  y2={y(rate)}
                  className="v2-chart-grid"
                />
                <text x="0" y={y(rate) + 4} className="v2-chart-axis">
                  {percent(rate)}
                </text>
              </g>
            ))}
            <path
              d={`${line} L${points.at(-1)!.x},184 L${points[0].x},184 Z`}
              fill={`url(#${gradientId})`}
            />
            <path d={line} className="v2-chart-line" />
            {milestone && (
              <g className="v2-chart-memory">
                <line
                  x1={x(milestone.position)}
                  x2={x(milestone.position)}
                  y1="24"
                  y2="184"
                />
                <circle cx={x(milestone.position)} cy="24" r="4" />
                <text x={x(milestone.position) + 12} y="28">
                  Ring rule learned
                </text>
              </g>
            )}
            {points.map(({ batch, x: px, y: py }) => (
              <a
                key={batch.id}
                href={`/p/mara?take=${encodeURIComponent(batch.id)}`}
                aria-label={`Open Take ${batch.index}, ${percent(batch.driftRate)} flagged`}
              >
                <title>{`Take ${batch.index}: ${percent(batch.driftRate)} flagged`}</title>
                <circle
                  cx={px}
                  cy={py}
                  r="7"
                  className={
                    batch.driftRate > 0
                      ? "v2-chart-point drift"
                      : "v2-chart-point"
                  }
                />
                <text
                  x={px}
                  y={py - 17}
                  textAnchor="middle"
                  className="v2-chart-value"
                >
                  {percent(batch.driftRate)}
                </text>
                <text
                  x={px}
                  y="221"
                  textAnchor="middle"
                  className="v2-chart-axis"
                >
                  Take {batch.index}
                </text>
              </a>
            ))}
          </svg>
          <div className="v2-chart-mobile-values">
            {batches.map((batch) => (
              <MotionLink
                key={batch.id}
                href={`/p/mara?take=${encodeURIComponent(batch.id)}`}
              >
                <span>Take {batch.index}</span>
                <strong>{percent(batch.driftRate)}</strong>
              </MotionLink>
            ))}
          </div>
          {milestone && (
            <p className="v2-chart-memory-caption">
              Ring rule learned · first applied in Take{" "}
              {batches[milestone.firstApplied].index}
            </p>
          )}
        </>
      ) : (
        <p className="v2-dashboard-empty">No checked takes yet.</p>
      )}
    </div>
  );
}

export function OverviewDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="v2-overview-dialog v2-screen"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="v2-dialog-top">
        <h2 id={titleId}>{title}</h2>
        <button
          className="v2-close"
          aria-label={`Close ${title}`}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
