"use client";
import { ReviewScreen } from "./review";
import { AppPageHeader } from "../ui/app-shell";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Batch } from "@/lib/types";
import { ScreenSkeleton } from "../ui/skeleton";
import { LocationReference } from "../ui/location-reference";
import { RuleCard } from "../ui/rule-card";
import { ShotCard } from "../ui/shot-card";
import { ShotImage } from "../shot-image";
import { ActionDock, AccessDialog, ErrorNotice, Kbd, Nav } from "../ui/chrome";
import {
  Ambient,
  Brackets,
  MotionLink,
  Scan,
  Tilt,
  useMotionNavigation,
} from "../ui/motion";
import {
  allShots,
  currentShot,
  frameName,
  generatedBatchId,
  nextTakeIndex,
  message,
  operationIssue,
  modelFor,
  modelLabel,
  percent,
  ruleCheckReach,
  rulePromptReach,
  sharedShot,
  shotStatus,
  shotsFor,
  sortedBatches,
  type ProductionData,
} from "./data";
import { useProduction } from "./provider";
import { useConfiguration } from "./config";

export function MemoryPanel({
  data,
  landedRuleId,
}: {
  data: ProductionData;
  landedRuleId?: string;
}) {
  const character = data.project.characters[0];
  const rules = [...data.rules].sort(
    (a, b) =>
      Number(a.source === "seed") - Number(b.source === "seed") ||
      b.createdAt.localeCompare(a.createdAt),
  );
  const accepted = data.shots.filter((s) => s.status === "accepted").length;
  return (
    <aside className="v2-memory" aria-label="Production memory">
      <div className="v2-rail-heading">
        <span className="v2-label">Memory · {character?.name ?? "—"}</span>
        <span className="v2-mono">
          {data.rules.length ? `${data.rules.length} rules` : "—"}
        </span>
      </div>
      {character && (
        <div className="v2-reference-summary">
          <ShotImage
            src={character.referenceImageUrl}
            variant="thumbnail"
            alt={`${character.name} reference`}
          />
          <div>
            <strong>Reference</strong>
            {accepted > 0 && (
              <>
                {" "}
                + {accepted} accepted {accepted === 1 ? "look" : "looks"}
              </>
            )}
            <p>{character.attributes.map((a) => a.label).join(" · ")}</p>
          </div>
        </div>
      )}
      {rules.map((rule) => (
        <RuleCard
          key={rule.id}
          rule={rule}
          data={data}
          land={rule.id === landedRuleId}
        />
      ))}
      {!rules.length && <p className="v2-memory-note">No learned rules yet.</p>}
      <LocationReference projectId={data.project.id} />
      <p className="v2-memory-note"></p>
    </aside>
  );
}
function TakeRail({
  data,
  active,
  choose,
}: {
  data: ProductionData;
  active?: Batch;
  choose: (batch: Batch) => void;
}) {
  const batches = sortedBatches(data),
    learned = new Set(
      data.rules.filter((r) => r.source !== "seed").map((r) => r.id),
    );
  const measuredBatches = batches.filter(
    (b) =>
      shotsFor(data, b.id).length &&
      shotsFor(data, b.id).every((s) => s.checks.some((c) => c.confidence > 0)),
  );
  const points = measuredBatches
    .map(
      (b, i) =>
        `${10 + (i / Math.max(1, measuredBatches.length - 1)) * 160},${46 - b.driftRate * 110}`,
    )
    .join(" ");
  return (
    <aside className="v2-takes" aria-label="Takes">
      <h2 className="v2-label">Takes</h2>
      {batches.map((batch) => (
        <button
          key={batch.id}
          className={`v2-take ${active?.id === batch.id ? "on" : ""}`}
          onClick={() => choose(batch)}
          aria-pressed={active?.id === batch.id}
        >
          <span className="v2-mini-map" aria-hidden="true">
            {shotsFor(data, batch.id).map((s) => (
              <i className={s.flagged ? "drift" : ""} key={s.id} />
            ))}
          </span>
          <span>
            Take {batch.index}{" "}
            {batch.rulesApplied.some((id) => learned.has(id)) && (
              <i
                className="v2-memory-dot"
                aria-label="Carried a learned rule"
              />
            )}
          </span>
          <span
            className={`v2-mono ${batch.driftRate > 0 ? "v2-drift-text" : ""}`}
          >
            {shotsFor(data, batch.id).some((s) =>
              s.checks.some((c) => c.confidence > 0),
            )
              ? percent(batch.driftRate)
              : "—"}
          </span>
        </button>
      ))}
      <p className="v2-takes-key">
        <i className="v2-memory-dot" /> carried a learned rule
      </p>
      <div className="v2-sparkline">
        <span className="v2-label">Monitor flags</span>
        {measuredBatches.length ? (
          <svg
            viewBox="0 0 180 54"
            role="img"
            aria-label={measuredBatches
              .map((b) => `Take ${b.index}: ${percent(b.driftRate)} flagged`)
              .join("; ")}
          >
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            {measuredBatches.map((b, i) => (
              <circle
                key={b.id}
                cx={10 + (i / Math.max(1, measuredBatches.length - 1)) * 160}
                cy={46 - b.driftRate * 110}
                r="3"
                fill={b.driftRate > 0 ? "var(--drift)" : "currentColor"}
              />
            ))}
          </svg>
        ) : (
          <span>—</span>
        )}
        <MotionLink href={`/p/${data.project.id}/evidence`} kind="evidence">
          See evidence →
        </MotionLink>
      </div>
    </aside>
  );
}
export function StudioScreen() {
  const { id, data, loading, error, busy, refresh, run, receipt } =
    useProduction();
  const { config, refreshConfig } = useConfiguration(),
    navigate = useMotionNavigation(),
    search = useSearchParams(),
    router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null),
    [localError, setLocalError] = useState(""),
    [access, setAccess] = useState(false),
    [drawer, setDrawer] = useState<"takes" | "memory" | null>(null),
    [dockOpen, setDockOpen] = useState(false),
    [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const railDialog = useRef<HTMLDialogElement>(null),
    started = useRef(false);
  const batches = sortedBatches(data),
    active =
      batches.find((b) => b.id === activeId) ??
      batches.find((b) => b.id === search.get("take")) ??
      batches.at(-1),
    shots = shotsFor(data, active?.id).map((s) =>
      data ? currentShot(s, data) : s,
    );
  const repaired = (data?.repairShots ?? []).filter((s) =>
    data?.repairs?.some(
      (r) =>
        r.shot_id === s.id &&
        data.shots.some(
          (source) =>
            source.id === r.source_shot_id && source.batchId === active?.id,
        ),
    ),
  );
  const flagged = shots.filter((s) => s.flagged),
    pending = flagged.filter((s) => s.status === "pending"),
    first = pending[0] ?? flagged[0] ?? shots[0];
  useEffect(() => {
    document.title = `${data?.project.name ?? "Scripty"} — Studio`;
  }, [data?.project.name, search]);
  useEffect(() => {
    if (drawer) railDialog.current?.showModal();
    else railDialog.current?.close();
  }, [drawer]);
  async function action(kind: "recheck" | "fix" | "generate") {
    setLocalError("");
    if (!config?.authorized) {
      setAccess(true);
      return;
    }
    try {
      const result = await run(
        kind,
        kind === "fix"
          ? { shotIds: flagged.map((s) => s.id) }
          : kind === "recheck"
            ? { shotIds: shots.map((s) => s.id) }
            : {},
      );
      const newBatchId = generatedBatchId(kind, result);
      if (newBatchId) {
        setActiveId(newBatchId);
        const query = new URLSearchParams(search.toString());
        query.set("take", newBatchId);
        query.delete("start");
        router.replace(`/p/${id}?${query.toString()}`, { scroll: false });
      }
      setLocalError(operationIssue(result));
    } catch (e) {
      setLocalError(message(e));
    }
  }
  useEffect(() => {
    if (
      !started.current &&
      data &&
      config?.authorized &&
      search.get("start") === "1" &&
      !data.shots.length &&
      !data.batches.length
    ) {
      started.current = true;
      void action("generate");
    }
  }, [data, search, config?.authorized]);
  useEffect(() => {
    if (search.get("panel") === "memory") setDrawer("memory");
  }, [search.get("panel")]);
  useEffect(() => {
    const openMemory = (event: Event) => {
      if (
        (event as CustomEvent<{ projectId: string }>).detail?.projectId === id
      )
        setDrawer("memory");
    };
    window.addEventListener("scripty:open-memory", openMemory);
    return () => window.removeEventListener("scripty:open-memory", openMemory);
  }, [id]);
  const closeDrawer = () => {
    setDrawer(null);
    if (search.get("panel") === "memory") {
      const query = new URLSearchParams(search.toString());
      query.delete("panel");
      router.replace(`/p/${id}${query.size ? `?${query}` : ""}`, {
        scroll: false,
      });
    }
  };
  const choose = (batch: Batch) => {
    setActiveId(batch.id);
    const query = new URLSearchParams(search.toString());
    query.set("take", batch.id);
    query.delete("start");
    router.replace(`/p/${id}?${query.toString()}`, { scroll: false });
    setDrawer(null);
  };
  return (
    <div className="v2-screen v2-workspace v2-studio">
      <Ambient />
      <AppPageHeader
        title="Studio"
        id={id}
        productionName={data?.project.name}
        memoryRules={data?.rules}
        action={
          <button
            className="v2-button"
            disabled={!!busy || !data}
            onClick={() => void action("generate")}
          >
            Generate take {data ? nextTakeIndex(data) : "—"}
          </button>
        }
      />
      <div className="v2-studio-grid">
        <div className="v2-desktop-rail">
          {data && <TakeRail data={data} active={active} choose={choose} />}
        </div>
        <div className="v2-contact-sheet">
          <div className="v2-mobile-rail-actions">
            <button
              className="v2-button v2-light"
              onClick={() => setDrawer("takes")}
              disabled={!data}
            >
              Takes
            </button>
            <button
              className="v2-button v2-light"
              onClick={() => setDrawer("memory")}
              disabled={!data}
            >
              Memory
              {data?.rules.some((rule) => rule.source !== "seed") && (
                <i className="v2-memory-dot" />
              )}
            </button>
          </div>
          <div className="v2-contact-heading">
            <h2>
              {active ? (
                <>
                  Take {active.index}{" "}
                  <span>
                    · {flagged.length} of {shots.length} flagged ·{" "}
                    {active.rulesApplied.length} rules applied
                  </span>
                </>
              ) : loading ? (
                "Opening the set…"
              ) : error && !data ? (
                "This production couldn’t open."
              ) : (
                "Your first take."
              )}
            </h2>
            <p
              className="v2-mono v2-model-line"
              title={
                data && active
                  ? `${modelFor(data, active, "image_model")} · checked by ${modelFor(data, active, "monitor_model")}`
                  : undefined
              }
            >
              {data && active ? (
                <>
                  {modelLabel(modelFor(data, active, "image_model"))}
                  {" · checked by "}
                  {modelLabel(modelFor(data, active, "monitor_model"))}
                </>
              ) : (
                "—"
              )}
            </p>
          </div>
          {(error || localError) && (
            <ErrorNotice
              retry={() => {
                void refresh().catch((e) => setLocalError(message(e)));
              }}
            >
              {localError || error}
            </ErrorNotice>
          )}
          {loading && <ScreenSkeleton />}
          {data && first && (
            <ReviewScreen
              shotId={
                shots.find((s) => s.id === selectedShotId)?.id ?? first.id
              }
              embedded
              onSelectShot={setSelectedShotId}
            />
          )}
          {data && repaired.length > 0 && (
            <section className="v2-repaired-shots">
              <h2 className="v2-label">Repaired shots · originals retained</h2>
              <div className="v2-shot-grid">
                {repaired.map((shot, i) => (
                  <ShotCard
                    key={shot.id}
                    shot={currentShot(shot, data)}
                    data={data}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}
          {data && !loading && !shots.length && (
            <section className="v2-empty-production">
              {data.project.characters[0] && (
                <ShotImage
                  src={data.project.characters[0].referenceImageUrl}
                  alt={`${data.project.characters[0].name}, ready for the first take`}
                />
              )}
              <h2>Your character is ready.</h2>
              <p>Let’s give them a scene.</p>
              <button
                className="v2-button"
                disabled={!!busy}
                onClick={() => void action("generate")}
              >
                Generate take {nextTakeIndex(data)}
              </button>
            </section>
          )}
          {busy && (
            <div className="v2-job-status" role="status">
              <Scan />
              <span>
                {busy === "generate"
                  ? "Developing the next take…"
                  : busy === "recheck"
                    ? "Checking against memory…"
                    : "Fixing the selected shots…"}
              </span>
            </div>
          )}
        </div>
        <div className="v2-desktop-rail">
          {data && (
            <MemoryPanel data={data} landedRuleId={receipt?.newRule?.id} />
          )}
        </div>
      </div>
      {data && (
        <ActionDock className={dockOpen ? "expanded" : ""}>
          {first ? (
            <MotionLink
              href={`/p/${id}/shot/${first.id}`}
              kind="shot"
              className={`v2-button ${flagged.length ? "v2-review-primary" : ""}`}
            >
              Review {flagged.length ? `${flagged.length} flagged` : "shots"}{" "}
              <Kbd>R</Kbd>
            </MotionLink>
          ) : (
            <span className="v2-label">Ready for a first take</span>
          )}
          <button
            className="v2-dock-toggle v2-button v2-light"
            onClick={() => setDockOpen(!dockOpen)}
            aria-expanded={dockOpen}
          >
            Take actions {dockOpen ? "⌄" : "⌃"}
          </button>
          <div className="v2-dock-more">
            <button
              className="v2-button v2-clear"
              disabled={!!busy || !shots.length}
              onClick={() => void action("recheck")}
            >
              Re-check with memory
            </button>
            <span className="v2-dock-divider" />
            <button
              className="v2-button v2-clear"
              disabled={!!busy || !flagged.length}
              onClick={() => void action("fix")}
            >
              Fix flagged only
            </button>
            <>
              {id === "mara" ? (
                <MotionLink
                  href="/new"
                  kind="start"
                  className="v2-button v2-light"
                >
                  Start your own take →
                </MotionLink>
              ) : (
                <button
                  className="v2-button v2-light"
                  disabled={!!busy}
                  onClick={() => void action("generate")}
                >
                  Generate take {nextTakeIndex(data)}{" "}
                  <span aria-hidden="true">⌄</span>
                </button>
              )}
            </>
          </div>
        </ActionDock>
      )}
      <dialog
        ref={railDialog}
        className="v2-rail-dialog"
        aria-label={drawer === "takes" ? "Takes" : "Memory"}
        onCancel={closeDrawer}
        onClose={() => setDrawer(null)}
      >
        <button
          className="v2-close"
          onClick={closeDrawer}
          aria-label={`Close ${drawer ?? "drawer"}`}
        >
          ×
        </button>
        {data &&
          (drawer === "takes" ? (
            <TakeRail data={data} active={active} choose={choose} />
          ) : (
            <MemoryPanel data={data} />
          ))}
      </dialog>
      <AccessDialog
        open={access}
        onClose={() => setAccess(false)}
        onGranted={() => {
          void refreshConfig();
        }}
      />
    </div>
  );
}
