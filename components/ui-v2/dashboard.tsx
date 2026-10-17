"use client";

import { AppPageHeader } from "../ui/app-shell";
import { useEffect, useState } from "react";
import { Icon } from "../icons";
import { ErrorNotice } from "../ui/chrome";
import { Ambient, MotionLink } from "../ui/motion";
import {
  HomeReviewQueue,
  HomeRecentRules,
  HomeAgents,
} from "../ui/production-home";
import {
  ProductionOverviewCard,
  RecordedTime,
} from "../ui/production-overview";
import { dashboardActivity, uniqueProductions } from "./dashboard-data";
import { message, request, type ProductionData } from "./data";
import { ProductionProvider, useProduction } from "./provider";

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
    [reload, setReload] = useState(0);
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
          setOwnedError("Some productions couldn’t be read. Try again.");
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
  const activity = dashboardActivity(productions);
  const retry = () => {
    setReload((value) => value + 1);
    void refresh().catch(() => {});
  };
  return (
    <div className="v2-screen v2-workspace v2-dashboard">
      <Ambient />
      <AppPageHeader title="Home" />
      <main className="v2-dashboard-main">
        {(error || ownedError) && (
          <ErrorNotice retry={retry}>{error || ownedError}</ErrorNotice>
        )}
        <div
          className="v2-home-banner"
          role="img"
          aria-label="Misty mountain landscape, photograph by Andreas Ebner"
        />
        <HomeReviewQueue
          productions={productions}
          loading={loading || ownedLoading}
        />
        <section id="productions" className="v2-dashboard-productions">
          <div className="v2-dashboard-section-heading">
            <h2>Productions</h2>
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
        <HomeRecentRules
          productions={productions}
          loading={loading || ownedLoading}
        />
        <HomeAgents productions={productions} />
        <section
          className="v2-dashboard-activity"
          aria-labelledby="activity-title"
        >
          <div className="v2-dashboard-section-heading">
            <h2 id="activity-title">Activity</h2>
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
