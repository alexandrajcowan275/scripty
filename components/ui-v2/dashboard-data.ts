import type { Rule, TraceEvent } from "@/lib/types";
import {
  confidence,
  failedCheck,
  frameName,
  sortedBatches,
  type ProductionData,
} from "./data";

export function uniqueProductions(productions: ProductionData[]) {
  return [
    ...new Map(productions.map((data) => [data.project.id, data])).values(),
  ];
}

/** Saved original-take checks only: rechecks, repaired shots and A/B evaluations are separate. */
export function productionTotals(productions: ProductionData[]) {
  return uniqueProductions(productions).reduce(
    (total, data) => {
      const batches = new Set(data.batches.map((batch) => batch.id));
      const shots = [
        ...new Map(
          data.shots
            .filter((shot) => batches.has(shot.batchId))
            .map((shot) => [shot.id, shot]),
        ).values(),
      ];
      total.checks += shots.reduce(
        (count, shot) => count + shot.checks.length,
        0,
      );
      total.flagged += shots.filter((shot) => shot.flagged).length;
      total.learned += new Set(
        data.rules
          .filter((rule) => rule.source !== "seed")
          .map((rule) => rule.id),
      ).size;
      return total;
    },
    { checks: 0, flagged: 0, learned: 0 },
  );
}

export function ringMilestone(data: ProductionData) {
  const rules = data.rules.filter(
    (rule) => rule.source !== "seed" && rule.attributeKey === "ring_hand",
  );
  const batches = sortedBatches(data);
  const firstApplied = batches.findIndex((batch) =>
    rules.some((rule) => batch.rulesApplied.includes(rule.id)),
  );
  if (firstApplied < 0) return null;
  const rule = rules.find((candidate) =>
    batches[firstApplied].rulesApplied.includes(candidate.id),
  )!;
  return { rule, firstApplied, position: Math.max(0, firstApplied - 0.5) };
}

export function lastProductionActivity(data: ProductionData) {
  return [
    ...data.batches.map((batch) => batch.createdAt),
    ...data.traces.map((trace) => trace.createdAt),
  ]
    .filter((date) => Number.isFinite(Date.parse(date)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

export type DashboardActivity = {
  event: TraceEvent;
  production: ProductionData;
  label: string;
  shot: string;
  detail: string;
  rule?: Rule;
  href: string;
};
export function dashboardActivity(
  productions: ProductionData[],
  limit = 8,
): DashboardActivity[] {
  const seen = new Set<string>();
  return uniqueProductions(productions)
    .flatMap((production) =>
      production.traces.flatMap((event) => {
        const key = `${production.project.id}:${event.id}`;
        if (seen.has(key)) return [];
        seen.add(key);
        const label =
          event.type === "flag"
            ? "Flagged"
            : event.type === "rule_learned"
              ? "Rule learned"
              : event.type === "rule_applied"
                ? "Rule applied"
                : event.type === "check" &&
                    /^(Creator accepted|Accepted\b)/i.test(event.message)
                  ? "Accepted"
                  : null;
        if (!label) return [];
        const shot = production.shots.find(
          (candidate) => candidate.id === event.shotId,
        );
        const check =
          shot &&
          (shot.checks.find((candidate) =>
            event.message.includes(`${candidate.key}:`),
          ) ??
            failedCheck(shot));
        const rule = production.rules.find(
          (candidate) =>
            event.message.includes(candidate.text) ||
            event.message.includes(`rule:${candidate.id}`) ||
            (event.type === "flag" && candidate.attributeKey === check?.key),
        );
        const batchIndex = /Applied to batch (\d+):/i.exec(event.message)?.[1];
        const batch = production.batches.find(
          (candidate) => String(candidate.index) === batchIndex,
        );
        const base = `/p/${encodeURIComponent(production.project.id)}`;
        return [
          {
            event,
            production,
            label,
            shot: shot ? frameName(shot, production) : "—",
            detail:
              event.type === "flag" && check
                ? `${check.key} · ${confidence(check.confidence)} · expected ${check.expected}; observed ${check.observed}`
                : event.message.split(";")[0],
            rule,
            href: shot
              ? `${base}/shot/${encodeURIComponent(shot.id)}`
              : batch
                ? `${base}?take=${encodeURIComponent(batch.id)}`
                : base,
          },
        ];
      }),
    )
    .sort(
      (a, b) => Date.parse(b.event.createdAt) - Date.parse(a.event.createdAt),
    )
    .slice(0, limit);
}

/** Historical flags remain evidence; only undecided shots belong in the work queue. */
export function pendingReviewShots(productions: ProductionData[]) {
  return uniqueProductions(productions)
    .flatMap((data) =>
      data.shots
        .filter((shot) => shot.flagged && shot.status === "pending")
        .map((shot) => ({ data, shot })),
    )
    .sort((a, b) => {
      const time = ({ data, shot }: typeof a) =>
        Date.parse(
          data.batches.find((batch) => batch.id === shot.batchId)?.createdAt ??
            "",
        ) || 0;
      return time(b) - time(a);
    });
}
