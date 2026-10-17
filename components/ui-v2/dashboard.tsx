"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "../icons";
import { Brand, ErrorNotice } from "../ui/chrome";
import { Ambient, MotionLink } from "../ui/motion";
import { LocationReference } from "../ui/location-reference";
import { EditorialBackdrop } from "../ui/editorial-backdrop";
import {
  OverviewDialog,
  ProductionDriftChart,
  ProductionOverviewCard,
  RecordedTime,
} from "../ui/production-overview";
import {
  dashboardActivity,
  productionTotals,
  uniqueProductions,
} from "./dashboard-data";
import { message, request, type ProductionData } from "./data";
import { ProductionProvider, useProduction } from "./provider";

const MemoryPanel = dynamic(
  () => import("./studio").then((module) => module.MemoryPanel),
  {
    loading: () => (
      <div
        className="v2-skeleton v2-dashboard-placeholder"
        role="status"
        aria-label="Opening memory"
      />
    ),
  },
);
type SavedProduction = {
  project_id: string;
  created_at: string;
  projects: { name: string } | null;
};

function DashboardContent() {
  const { data, loading, error, refresh } = useProduction();
  const [owned, setOwned] = useState<SavedProduction[]>([]),
    [ownedData, setOwnedData] = useState<ProductionData[]>([]),
    [ownedLoading, setOwnedLoading] = useState(true),
    [ownedError, setOwnedError] = useState(""),
    [reload, setReload] = useState(0),
    [panel, setPanel] = useState<"memory" | "locations" | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setOwnedLoading(true);
    setOwnedError("");
    request<{ productions: SavedProduction[] }>("/api/productions", {
      signal: controller.signal,
    })
      .then(async (result) => {
        const list = [
          ...new Map(
            (result.productions ?? [])
              .filter((item) => item.project_id !== "mara")
              .map((item) => [item.project_id, item]),
          ).values(),
        ];
        if (!controller.signal.aborted) setOwned(list);
        const results = await Promise.allSettled(
          list.map((item) =>
            request<ProductionData>(
              `/api/project/${encodeURIComponent(item.project_id)}`,
              { signal: controller.signal },
            ),
          ),
        );
        if (controller.signal.aborted) return;
        setOwnedData(
          results.flatMap((result) =>
            result.status === "fulfilled" &&
            result.value.project &&
            Array.isArray(result.value.shots) &&
            Array.isArray(result.value.batches) &&
            Array.isArray(result.value.rules) &&
            Array.isArray(result.value.traces)
              ? [result.value]
              : [],
          ),
        );
        if (
          results.some(
            (result) =>
              result.status === "rejected" ||
              (result.status === "fulfilled" &&
                (!result.value.project ||
                  !Array.isArray(result.value.shots) ||
                  !Array.isArray(result.value.batches) ||
                  !Array.isArray(result.value.rules) ||
                  !Array.isArray(result.value.traces))),
          )
        )
          setOwnedError(
            "Some productions couldn’t be read. Totals are unavailable.",
          );
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setOwnedError(message(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setOwnedLoading(false);
      });
    return () => controller.abort();
  }, [reload]);
  const productions = uniqueProductions([
    ...(data ? [data] : []),
    ...ownedData,
  ]);
  const ready = !!data && !ownedLoading && !ownedError && !error;
  const totals = ready ? productionTotals(productions) : null;
  const activity = dashboardActivity(productions);
  const retry = () => {
    setReload((value) => value + 1);
    void refresh().catch(() => {});
  };
  const nav = (label: string, icon: IconName, href: string, active = false) => (
    <MotionLink
      href={href}
      className={`v2-dashboard-nav-item ${active ? "on" : ""}`}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </MotionLink>
  );
  return (
    <div className="v2-screen v2-dashboard">
      <Ambient />
      <aside className="v2-dashboard-sidebar">
        <Brand />
        <nav aria-label="Workspace" className="v2-dashboard-nav">
          {nav("Home", "frame", "/dashboard", true)}
          {nav("Productions", "slate", "#productions")}
          <button
            className="v2-dashboard-nav-item"
            disabled={!data}
            onClick={() => setPanel("memory")}
          >
            <Icon name="layers" />
            <span>Memory</span>
          </button>
          {nav("Evidence", "activity", "/p/mara/evidence")}
          {nav("Eval", "check", "/p/mara/eval")}
          {nav("API", "terminal", "/developers")}
        </nav>
        <div className="v2-dashboard-products">
          <span className="v2-dashboard-group-label">Products</span>
          <nav aria-label="Products">
            <button
              className="v2-dashboard-nav-item"
              onClick={() => setPanel("locations")}
            >
              <Icon name="image" />
              <span>Locations</span>
            </button>
            <button className="v2-dashboard-nav-item" disabled>
              <Icon name="play" />
              <span>Video</span>
              <small>Soon</small>
            </button>
            <button className="v2-dashboard-nav-item" disabled>
              <Icon name="layers" />
              <span>Team</span>
              <small>Soon</small>
            </button>
          </nav>
        </div>
        <div className="v2-dashboard-sidebar-foot">
          <span className="v2-memory-dot" /> Your AI script supervisor.
        </div>
      </aside>
      <main className="v2-dashboard-main">
        <header className="v2-dashboard-header">
          <EditorialBackdrop kind="couture" />
          <div>
            <span className="v2-dashboard-eyebrow">The production office</span>
            <h1>Your productions</h1>
          </div>
          <MotionLink href="/new" kind="start" className="v2-button">
            <Icon name="plus" />
            New production
          </MotionLink>
        </header>
        {(error || ownedError) && (
          <ErrorNotice retry={retry}>{error || ownedError}</ErrorNotice>
        )}
        <section
          className="v2-dashboard-metrics"
          aria-label="Saved production totals"
          aria-busy={loading || ownedLoading}
        >
          <div className="v2-dashboard-main-metric">
            <span>Saved attribute checks</span>
            <strong>
              {totals ? totals.checks.toLocaleString("en-US") : "—"}
            </strong>
            <p>Across all saved takes</p>
          </div>
          <div className="v2-dashboard-small-metric">
            <span className="v2-dashboard-signal drift" />
            <strong>{totals?.flagged ?? "—"}</strong>
            <span>Drift caught</span>
            <small>Shots flagged by the monitor</small>
          </div>
          <div className="v2-dashboard-small-metric">
            <span className="v2-dashboard-signal memory" />
            <strong>{totals?.learned ?? "—"}</strong>
            <span>Rules learned</span>
            <small>Saved to production memory</small>
          </div>
        </section>
        {data ? (
          <ProductionDriftChart data={data} />
        ) : (
          <div
            className="v2-skeleton v2-dashboard-chart-skeleton"
            role="status"
            aria-label={
              loading ? "Loading real take history" : "Take history unavailable"
            }
          />
        )}
        <section id="productions" className="v2-dashboard-productions">
          <div className="v2-dashboard-section-heading">
            <h2>On the slate</h2>
            <span>
              {data
                ? `${1 + owned.length} ${owned.length ? "productions" : "production"}`
                : "—"}
            </span>
          </div>
          <div className="v2-dashboard-cards">
            {data ? (
              <ProductionOverviewCard
                data={data}
                name={data.project.name}
                id={data.project.id}
                sample
              />
            ) : (
              <div
                className="v2-skeleton v2-dashboard-card-skeleton"
                role="status"
                aria-label="Loading Mara"
              />
            )}
            {owned.map((item) => (
              <ProductionOverviewCard
                key={item.project_id}
                data={ownedData.find(
                  (production) => production.project.id === item.project_id,
                )}
                name={item.projects?.name ?? "Untitled production"}
                id={item.project_id}
                createdAt={item.created_at}
              />
            ))}
            <MotionLink href="/new" kind="start" className="v2-overview-new">
              <span className="v2-overview-plus">
                <Icon name="plus" size={24} />
              </span>
              <strong>New production</strong>
              <span>Give your next story a memory.</span>
            </MotionLink>
          </div>
        </section>
        <section
          className="v2-dashboard-activity"
          aria-labelledby="activity-title"
        >
          <div className="v2-dashboard-section-heading">
            <h2 id="activity-title">From the set</h2>
            <span>Recent activity</span>
          </div>
          <div
            className="v2-dashboard-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Recent production activity. Scroll horizontally for all columns."
          >
            <table>
              <thead>
                <tr>
                  {["Event", "Shot", "Detail", "Rule", "Time"].map(
                    (heading) => (
                      <th key={heading} scope="col">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={`${row.production.project.id}:${row.event.id}`}>
                    <td>
                      <MotionLink
                        href={row.href}
                        className={`v2-activity-event ${row.event.type === "flag" ? "drift" : row.event.type === "rule_learned" ? "memory" : ""}`}
                      >
                        <span className="v2-activity-dot" />
                        {row.label}
                      </MotionLink>
                    </td>
                    <td>
                      <MotionLink
                        href={row.href}
                        className="v2-mono"
                        title={row.production.project.name}
                      >
                        {row.shot}
                      </MotionLink>
                    </td>
                    <td>
                      <MotionLink
                        href={row.href}
                        className="v2-activity-detail"
                        title={row.detail}
                      >
                        {row.detail}
                      </MotionLink>
                    </td>
                    <td>
                      <MotionLink
                        href={row.href}
                        className={`v2-activity-rule ${row.rule && row.rule.source !== "seed" ? "memory" : ""}`}
                        title={row.rule?.text}
                      >
                        {row.rule?.text ?? "—"}
                      </MotionLink>
                    </td>
                    <td>
                      <RecordedTime value={row.event.createdAt} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!activity.length && (
            <p className="v2-dashboard-empty">
              {loading
                ? "Opening the production log…"
                : "Your next take starts the story."}
            </p>
          )}
        </section>
      </main>
      {panel && (
        <OverviewDialog
          title={
            panel === "memory" ? "Scripty Memory · Mara" : "Locations · Mara"
          }
          onClose={() => setPanel(null)}
        >
          {panel === "memory" && data ? (
            <MemoryPanel data={data} />
          ) : (
            <>
              <p className="v2-muted">World Labs · captured location still</p>
              <LocationReference projectId="mara" />
            </>
          )}
        </OverviewDialog>
      )}
    </div>
  );
}
export function DashboardScreen() {
  return (
    <ProductionProvider id="mara">
      <DashboardContent />
    </ProductionProvider>
  );
}
