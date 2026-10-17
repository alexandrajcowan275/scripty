"use client";

import { AppPageHeader } from "../ui/app-shell";
import { useEffect, useState } from "react";
import { ShotImage } from "../shot-image";
import { ErrorNotice } from "../ui/chrome";
import { Ambient, MotionLink } from "../ui/motion";
import { ProductionTable } from "../ui/production-table";
import {
  currentShot,
  frameName,
  message,
  request,
  shotsFor,
  sortedBatches,
  type ProductionData,
} from "./data";
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
  const latest = sortedBatches(data).at(-1);
  const latestShots = shotsFor(data, latest?.id).map((shot) =>
    data ? currentShot(shot, data) : shot,
  );
  const [query, setQuery] = useState("");
  const rows = [
    ...(data ? [{ id: data.project.id, name: data.project.name, data }] : []),
    ...owned.map((item) => ({
      id: item.project_id,
      name: item.projects?.name ?? "Untitled production",
      data: ownedData.find((p) => p.project.id === item.project_id),
      createdAt: item.created_at,
    })),
  ].filter((row) => row.name.toLowerCase().includes(query.toLowerCase()));
  const retry = () => {
    setReload((value) => value + 1);
    void refresh().catch(() => {});
  };
  return (
    <div className="v2-screen v2-workspace v2-dashboard">
      <Ambient />
      <AppPageHeader title="Productions" memoryRules={data?.rules} />
      <main className="v2-dashboard-main">
        {(error || ownedError) && (
          <ErrorNotice retry={retry}>{error || ownedError}</ErrorNotice>
        )}
        <h2 className="v2-home-title">Productions</h2>
        <div className="v2-production-table-tools">
          <input
            aria-label="Search productions"
            placeholder="Search productions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ProductionTable rows={rows} loading={loading || ownedLoading} />
        {data && latest && (
          <section className="v2-home-latest">
            <div className="v2-home-latest-heading">
              <h3>
                {data.project.name}
                <span> · Take {latest.index}</span>
              </h3>
              <MotionLink
                href={`/p/${data.project.id}?take=${latest.id}`}
                className="v2-mono"
              >
                Open in Studio ›
              </MotionLink>
            </div>
            <div className="v2-home-contact">
              {latestShots.map((shot) => (
                <MotionLink
                  key={shot.id}
                  href={`/p/${data.project.id}/shot/${shot.id}`}
                  kind="shot"
                  className={shot.flagged ? "flagged" : ""}
                >
                  <ShotImage
                    src={shot.imageUrl}
                    alt={shot.scenePrompt}
                    variant="thumbnail"
                  />
                  <span className="v2-filmstrip-frame v2-mono">
                    {frameName(shot, data)}
                    {shot.flagged ? " · drift" : ""}
                  </span>
                </MotionLink>
              ))}
            </div>
          </section>
        )}
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
