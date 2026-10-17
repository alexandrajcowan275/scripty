"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Batch, Project, Rule, Shot, TraceEvent } from "@/lib/types";
import { Icon } from "./icons";
import { ShotImage } from "./shot-image";
import { batchEvidence, parseScenePrompts } from "./batch-evidence";
import { correctionReach, type ArchiveEvidence } from "./demo-evidence";

type Metadata = {
  mode?: string;
  effectiveMode?: string;
  demoMode?: string;
  warning?: string;
  warnings?: string[];
  provenance?: unknown;
  recordedRuleIds?: string[];
};
type ProjectData = Metadata & {
  project: Project;
  rules: Rule[];
  batches: Batch[];
  shots: Shot[];
  traces: TraceEvent[];
};
type BatchResponse = Metadata & { batch: Batch; shots: Shot[] };
type ReviewResponse = Metadata & { shot: Shot; newRule?: Rule };
const pct = (value: number) => `${Math.round(value * 100)}%`;
const number = (value: number) => String(value).padStart(2, "0");
const captureTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Capture time unavailable"
    : `${date.toISOString().slice(11, 19)} UTC`;
};
const humanize = (value: string) => value.replaceAll("_", " ");
const isScaffold = (data: ProjectData) =>
  data.shots.some((shot) => shot.id.startsWith("mock-"));
function mergeById<T extends { id: string }>(
  previous: T[],
  incoming: T[],
): T[] {
  const values = new Map(previous.map((item) => [item.id, item]));
  for (const item of incoming) values.set(item.id, item);
  return [...values.values()];
}
function mergeData(
  previous: ProjectData | null,
  incoming: ProjectData,
): ProjectData {
  if (!previous) return incoming;
  // TASK 0 returns stateless snapshots. Keep explicit review responses until the real engine is integrated.
  const shots = isScaffold(incoming)
    ? mergeById(incoming.shots, previous.shots)
    : mergeById(previous.shots, incoming.shots);
  return {
    ...previous,
    ...incoming,
    shots,
    rules: mergeById(previous.rules, incoming.rules),
    batches: mergeById(previous.batches, incoming.batches),
    traces: mergeById(previous.traces, incoming.traces),
  };
}
async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const external = options?.signal;
  const abort = () => controller.abort();
  external?.addEventListener("abort", abort, { once: true });
  if (external?.aborted) controller.abort();
  const timeout = setTimeout(
    abort,
    url === "/api/batch"
      ? 310_000
      : options?.method === "POST"
        ? 190_000
        : 20_000,
  );
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(
        "The server returned an unreadable response. Please try again.",
      );
    }
    if (!response.ok)
      throw new Error(
        typeof payload.error === "string"
          ? payload.error
          : `Request failed (${response.status}). Please try again.`,
      );
    return payload as T;
  } catch (error) {
    if (controller.signal.aborted && !external?.aborted)
      throw new Error(
        "This request took too long. Your existing shots are safe; please try again.",
      );
    throw error;
  } finally {
    clearTimeout(timeout);
    external?.removeEventListener("abort", abort);
  }
}
function passedChecks(shot: Shot) {
  return shot.checks.filter(
    (check) =>
      check.pass &&
      check.confidence >= 0.6 &&
      check.observed.toLowerCase() !== "unclear",
  ).length;
}
function uncertain(shot: Shot) {
  return (
    shot.checks.length === 0 ||
    shot.checks.some(
      (check) =>
        check.confidence < 0.6 || check.observed.toLowerCase() === "unclear",
    )
  );
}
function sourceInfo(data: ProjectData | null) {
  if (!data)
    return {
      title: "Connecting",
      description: "Loading project metadata",
      kind: "unknown",
    };
  if (isScaffold(data))
    return {
      title: "Scaffold preview",
      description: "Illustrative fixture checks · no AI analysis",
      kind: "cached",
    };
  if (data.provenance === "cache_unavailable")
    return {
      title: "Cache not installed",
      description:
        "Playback unavailable · no recorded images or checks installed",
      kind: "unavailable",
    };
  const mode = data.effectiveMode ?? data.mode ?? data.demoMode ?? "";
  if (
    mode.toLowerCase().includes("cached") ||
    mode.toLowerCase().includes("replay")
  )
    return {
      title: "Cached playback",
      description: "Saved generations and checks · no hidden model requests",
      kind: "cached",
    };
  if (mode.toLowerCase().includes("live"))
    return {
      title: "Live engine",
      description: "Generate runs the configured image and monitoring models",
      kind: "live",
    };
  return {
    title: "API connected",
    description: "Source metadata unavailable · check the trace for provenance",
    kind: "unknown",
  };
}
export function ScriptyStudio({
  archive,
  initialEvidence = false,
}: {
  archive?: ArchiveEvidence;
  initialEvidence?: boolean;
}) {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reason, setReason] = useState("");
  const [sceneInput, setSceneInput] = useState("");
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [newBatchId, setNewBatchId] = useState<string | null>(null);
  const [newRuleId, setNewRuleId] = useState<string | null>(null);
  const autoReplayRef = useRef(false);
  const memoryDialogRef = useRef<HTMLDialogElement>(null);
  const evidenceDialogRef = useRef<HTMLDialogElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const previewDialogRef = useRef<HTMLDialogElement>(null);
  const sceneEditorRef = useRef<HTMLDetailsElement>(null);
  const sceneInputRef = useRef<HTMLTextAreaElement>(null);
  const generationStartIndexRef = useRef(0);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const incoming = await api<ProjectData>("/api/project/mara", { signal });
    if (
      !incoming.project ||
      !Array.isArray(incoming.shots) ||
      !Array.isArray(incoming.batches) ||
      !Array.isArray(incoming.rules) ||
      !Array.isArray(incoming.traces)
    )
      throw new Error("Project data is incomplete. Please reload the project.");
    if (signal?.aborted) return;
    setData((previous) => mergeData(previous, incoming));
    setSelectedId(
      (previous) =>
        previous ?? preferredShot(incoming.shots, incoming.batches)?.id ?? null,
    );
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal)
      .catch((err: unknown) => {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error ? err.message : "Could not load the project.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refresh]);
  const selected = data?.shots.find((shot) => shot.id === selectedId) ?? null;
  const selectedBatch = data?.batches.find(
    (batch) => batch.id === selected?.batchId,
  );
  const selectedUncertain = selected ? uncertain(selected) : false;
  const character = data?.project.characters[0];
  const source = sourceInfo(data);
  const busy = generating || reviewing;
  const replayComplete =
    source.kind === "cached" &&
    !!archive &&
    (data?.batches.length ?? 0) >= archive.takes.length;
  const activeBatch =
    selectedBatch ??
    [...(data?.batches ?? [])].sort((a, b) => b.index - a.index)[0];
  const activeShots = (data?.shots ?? []).filter(
    (shot) => shot.batchId === activeBatch?.id,
  );
  const activeEvidence = batchEvidence(activeShots);
  const finding = selected?.checks.find(
    (check) =>
      !check.pass &&
      check.confidence >= 0.6 &&
      check.observed.toLowerCase() !== "unclear",
  );
  const marker =
    selected && finding ? recordedMarker(selected.id, finding.key) : null;
  useEffect(() => {
    if (initialEvidence) evidenceDialogRef.current?.showModal();
  }, [initialEvidence]);
  useEffect(() => {
    if (
      !loading &&
      data &&
      source.kind === "cached" &&
      !data.shots.length &&
      !autoReplayRef.current
    ) {
      autoReplayRef.current = true;
      void generate();
    }
  }, [loading, data, source.kind]);
  const batches = [...(data?.batches ?? [])].sort((a, b) => b.index - a.index);
  const allShots = data?.shots ?? [];
  const learned = (data?.rules ?? []).filter((rule) => rule.source !== "seed");
  const recordedRuleIds = new Set(data?.recordedRuleIds ?? []);
  const warnings = [
    ...(data?.warnings ?? []),
    ...(data?.warning ? [data.warning] : []),
  ];
  const inProgressBatch = generating
    ? batches.find((batch) => batch.index > generationStartIndexRef.current)
    : undefined;
  const savedGenerationShots = inProgressBatch
    ? allShots.filter((shot) => shot.batchId === inProgressBatch.id).length
    : 0;
  useEffect(() => {
    if (!generating || source.kind !== "live") return;
    const controller = new AbortController();
    let polling = false;
    const interval = setInterval(() => {
      if (polling) return;
      polling = true;
      // Read-only progress. The user action above is the sole batch POST.
      void refresh(controller.signal)
        .catch(() => {
          /* Keep the bounded POST's final result authoritative. */
        })
        .finally(() => {
          polling = false;
        });
    }, 4000);
    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [generating, source.kind, refresh]);

  async function generate() {
    if (busy || !data || source.kind === "unavailable") return;
    let scenePrompts: string[] | undefined;
    try {
      scenePrompts =
        source.kind === "live" ? parseScenePrompts(sceneInput) : undefined;
      setSceneError(null);
    } catch (err) {
      setSceneError(
        err instanceof Error ? err.message : "Check your scene prompts.",
      );
      if (sceneEditorRef.current) sceneEditorRef.current.open = true;
      requestAnimationFrame(() => sceneInputRef.current?.focus());
      return;
    }
    const existingBatchIds = new Set(data.batches.map((batch) => batch.id));
    generationStartIndexRef.current = Math.max(
      0,
      ...data.batches.map((batch) => batch.index),
    );
    setGenerating(true);
    setError(null);
    setNotice(null);
    setNewRuleId(null);
    try {
      const result = await api<BatchResponse>("/api/batch", {
        method: "POST",
        body: JSON.stringify({
          projectId: data.project.id,
          ...(scenePrompts ? { scenePrompts } : {}),
        }),
      });
      if (!result.batch || !Array.isArray(result.shots))
        throw new Error(
          "The batch response was incomplete. Your existing shots are still available.",
        );
      // Progress polling may already have delivered this newly generated batch.
      const alreadyExists = existingBatchIds.has(result.batch.id);
      setData((current) =>
        current
          ? {
              ...current,
              ...result,
              batches: mergeById(current.batches, [result.batch]),
              shots:
                alreadyExists && isScaffold(current)
                  ? mergeById(result.shots, current.shots)
                  : mergeById(current.shots, result.shots),
            }
          : current,
      );
      setSelectedId(preferredShot(result.shots, [result.batch])?.id ?? null);
      setReason("");
      setNewBatchId(result.batch.id);
      const evidence = batchEvidence(result.shots);
      setNotice(
        alreadyExists
          ? "This recorded batch is already on set."
          : !evidence.complete
            ? "Some frames are still missing. Inspect the saved shots."
            : `Batch ${number(result.batch.index)} ready. ${result.shots.filter((shot) => shot.flagged).length} of 6 flagged.`,
      );
      try {
        await refresh();
      } catch (err) {
        setError(
          `Batch saved, but project refresh failed. ${err instanceof Error ? err.message : "Try refreshing."}`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate a batch. Please try again.",
      );
      // A timed-out request may still have persisted successful independent frames.
      try {
        await refresh();
      } catch {
        /* Preserve the original generation error and existing frames. */
      }
    } finally {
      setGenerating(false);
    }
  }
  async function review(decision: "accept" | "reject") {
    if (!selected || busy) return;
    if (decision === "reject" && !reason.trim()) {
      requestAnimationFrame(() => reasonRef.current?.focus());
      return;
    }
    setReviewing(true);
    setError(null);
    setNotice(null);
    try {
      const result = await api<ReviewResponse>(
        `/api/shot/${encodeURIComponent(selected.id)}/review`,
        {
          method: "POST",
          body: JSON.stringify({
            decision,
            ...(decision === "reject" ? { reason: reason.trim() } : {}),
          }),
        },
      );
      if (!result.shot)
        throw new Error(
          "The review response was incomplete. Please try again.",
        );
      setData((current) =>
        current
          ? {
              ...current,
              ...result,
              shots: mergeById(current.shots, [result.shot]),
              rules: result.newRule
                ? mergeById(current.rules, [result.newRule])
                : current.rules,
            }
          : current,
      );
      if (result.newRule) setNewRuleId(result.newRule.id);
      setNotice(
        result.newRule
          ? source.kind === "cached"
            ? "Rule saved to this replay."
            : "Noted. On the next take."
          : decision === "accept"
            ? "Good take. Accepted."
            : "Correction noted.",
      );
      setReason("");
      try {
        await refresh();
      } catch (err) {
        setError(
          `Review saved, but project refresh failed. ${err instanceof Error ? err.message : "Try refreshing."}`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save your review. Please try again.",
      );
    } finally {
      setReviewing(false);
    }
  }
  useEffect(() => {
    if (!notice || newRuleId) return;
    const timer = setTimeout(() => setNotice(null), 5500);
    return () => clearTimeout(timer);
  }, [notice, newRuleId]);
  const reviewRef = useRef(review);
  reviewRef.current = review;
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // Native modal previews are read-only: never review a frame behind the dialog.
      if (document.querySelector("dialog[open]")) return;
      const target = event.target;
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            /INPUT|TEXTAREA|SELECT/.test(target.tagName)))
      )
        return;
      if (event.key.toLowerCase() === "a") {
        event.preventDefault();
        void reviewRef.current("accept");
      }
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        void reviewRef.current("reject");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  function selectShot(id: string) {
    setSelectedId(id);
    setReason("");
  }
  async function retry() {
    setLoading(true);
    setError(null);
    try {
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="studio-shell">
      <a className="skip-link" href="#workbench">
        Skip to shots
      </a>
      <header className="studio-nav">
        <a className="wordmark" href="/" aria-label="Scripty home">
          scripty
        </a>
        <span className="nav-divider" />
        <span className="project-name">{data?.project.name ?? "Mara"}</span>
        <span className="mode-pill" title={source.description}>
          {source.kind === "live"
            ? "Live engine"
            : source.kind === "unavailable"
              ? "Replay unavailable"
              : source.kind === "unknown"
                ? "Opening…"
                : "Demo mode"}
        </span>
        <nav aria-label="Workspace">
          <button
            className="nav-action"
            onClick={() => memoryDialogRef.current?.showModal()}
          >
            <Icon name="spark" size={16} />
            Memory{" "}
            {learned.length ? (
              <span className="memory-count">{learned.length}</span>
            ) : null}
          </button>
          <button
            className="nav-action"
            onClick={() => evidenceDialogRef.current?.showModal()}
          >
            <Icon name="layers" size={16} />
            Evidence
          </button>
        </nav>
      </header>
      <main id="workbench" className="studio-main">
        <div className="studio-heading">
          <div>
            <span className="overline">THE CONTINUITY DESK</span>
            <h1>
              {data?.project.name ?? "Mara"},{" "}
              {activeBatch ? `take ${number(activeBatch.index)}.` : "on set."}
            </h1>
          </div>
          <button
            className="action primary next-batch"
            onClick={() => void generate()}
            disabled={
              busy || !data || source.kind === "unavailable" || replayComplete
            }
          >
            <Icon
              name={
                generating
                  ? "refresh"
                  : source.kind === "cached"
                    ? "play"
                    : "plus"
              }
              size={16}
              className={generating ? "spin" : ""}
            />
            {generating
              ? source.kind === "cached"
                ? "Loading the take…"
                : "Building the take…"
              : source.kind === "unavailable"
                ? "Replay unavailable"
                : replayComplete
                  ? "All takes loaded"
                  : source.kind === "cached"
                    ? "Load next batch"
                    : "Generate batch"}
          </button>
        </div>
        <div className="workflow-line">
          <ol aria-label="Production steps">
            {["Generate", "Review", "Learn", "Regenerate"].map(
              (step, index) => (
                <li
                  key={step}
                  aria-current={
                    (generating
                      ? 0
                      : newRuleId
                        ? 2
                        : allShots.length
                          ? 1
                          : 0) === index
                      ? "step"
                      : undefined
                  }
                >
                  <span>{index + 1}</span>
                  {step}
                </li>
              ),
            )}
          </ol>
          <span className="recording-scope">
            {source.kind === "cached"
              ? "Recorded shots · local reviews"
              : source.kind === "live"
                ? "Reference-conditioned generation"
                : "Opening the project"}
          </span>
        </div>
        {error ? (
          <div className="message error-message" role="alert">
            <span>{error}</span>
            <button onClick={() => void retry()} disabled={busy || loading}>
              Retry project
            </button>
            <button
              className="icon-action"
              aria-label="Dismiss error"
              onClick={() => setError(null)}
            >
              <Icon name="close" />
            </button>
          </div>
        ) : null}
        {warnings.length ? (
          <details className="workspace-note">
            <summary>About this replay</summary>
            {warnings.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </details>
        ) : null}
        {source.kind === "live" ? (
          <details className="scene-editor" ref={sceneEditorRef}>
            <summary>
              Scene prompts <Icon name="chevron" size={14} />
            </summary>
            <label htmlFor="scene-prompts">Six scenes. One per line.</label>
            <textarea
              id="scene-prompts"
              ref={sceneInputRef}
              value={sceneInput}
              onChange={(event) => {
                setSceneInput(event.target.value);
                setSceneError(null);
              }}
              rows={6}
              maxLength={12006}
              disabled={busy}
              aria-invalid={Boolean(sceneError)}
              placeholder="Leave blank for the project’s scenes."
            />
            {sceneError ? (
              <p role="alert" className="field-error">
                {sceneError}
              </p>
            ) : null}
          </details>
        ) : null}
        {loading && !data ? (
          <div className="opening-state" role="status">
            <span className="loading-dot" />
            Opening the set…
          </div>
        ) : selected ? (
          <>
            <div className="take-toolbar">
              <div className="take-select">
                <label htmlFor="take-select">Take</label>
                <select
                  id="take-select"
                  value={activeBatch?.id ?? ""}
                  onChange={(event) => {
                    const next = (data?.shots ?? []).filter(
                      (shot) => shot.batchId === event.target.value,
                    );
                    const shot = preferredShot(next, data?.batches ?? []);
                    if (shot) selectShot(shot.id);
                  }}
                >
                  {[...batches]
                    .sort((a, b) => a.index - b.index)
                    .map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {number(batch.index)} ·{" "}
                        {
                          allShots.filter((shot) => shot.batchId === batch.id)
                            .length
                        }
                        /6 shots
                      </option>
                    ))}
                </select>
              </div>
              <span>
                {activeShots.filter((shot) => shot.flagged).length} flagged
                <span className="meta-dot">·</span>
                {activeEvidence.uncertainChecks} uncertain checks
              </span>
              <span className="capture-label">
                {source.kind === "cached"
                  ? "Recorded check"
                  : activeBatch
                    ? captureTime(activeBatch.createdAt)
                    : ""}
              </span>
            </div>
            <section className="review-layout" aria-label="Shot review">
              <div className="review-stage">
                <div className="fitted-frame">
                  <ShotImage
                    src={selected.imageUrl}
                    alt={selected.scenePrompt}
                    priority
                  />
                  {marker ? (
                    <button
                      className="image-marker"
                      style={{
                        left: `${marker.x * 100}%`,
                        top: `${marker.y * 100}%`,
                        width: `${marker.width * 100}%`,
                        height: `${marker.height * 100}%`,
                      }}
                      onClick={() => evidenceDialogRef.current?.showModal()}
                      aria-label={`${marker.label}. Editor-positioned pointer; inspect the recorded monitor evidence.`}
                    >
                      <img src={marker.asset} alt="" aria-hidden="true" />
                      <span>{marker.label}</span>
                    </button>
                  ) : null}
                  <div className="frame-slate">
                    <span>
                      B{number(activeBatch?.index ?? 1)} / FR{" "}
                      {number(
                        activeShots.findIndex(
                          (shot) => shot.id === selected.id,
                        ) + 1,
                      )}
                    </span>
                    <button
                      onClick={() => previewDialogRef.current?.showModal()}
                      aria-label="Expand frame"
                    >
                      <Icon name="expand" size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <aside
                className="decision-panel"
                aria-labelledby="decision-title"
              >
                <div
                  className={`finding-label ${selected.flagged ? "is-drift" : ""}`}
                >
                  <span>
                    {selected.flagged ? "!" : selectedUncertain ? "?" : "✓"}
                  </span>
                  {selected.flagged
                    ? "Continuity slip"
                    : selectedUncertain
                      ? "Not fully visible"
                      : "No drift flagged"}
                </div>
                <h2 id="decision-title">
                  {finding
                    ? findingTitle(finding.key)
                    : selectedUncertain
                      ? "A closer look."
                      : "Good in this light."}
                </h2>
                <p className="decision-hint">
                  {finding
                    ? "Check the detail before you decide."
                    : selectedUncertain
                      ? "Some details are out of view."
                      : "Your eye gets the final say."}
                </p>
                <details className="check-evidence">
                  <summary>
                    Evidence{" "}
                    <span>
                      {passedChecks(selected)}/{selected.checks.length} visible
                      passes
                    </span>
                    <Icon name="chevron" size={14} />
                  </summary>
                  <CheckList shot={selected} character={character} />
                  <p className="evidence-caption">
                    Confidence is model-reported, not calibrated.
                  </p>
                </details>
                <form
                  className="review-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void review("reject");
                  }}
                >
                  <label htmlFor="rejection-reason">Reason for rejection</label>
                  <textarea
                    id="rejection-reason"
                    ref={reasonRef}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={3}
                    maxLength={400}
                    disabled={busy}
                    placeholder="What should Scripty remember?"
                    aria-describedby="review-scope"
                  />
                  <button
                    className="action primary"
                    disabled={busy || !reason.trim()}
                    type="submit"
                  >
                    {reviewing ? "Saving the note…" : "Reject & remember"}
                    <span className="shortcut">R</span>
                  </button>
                  <button
                    type="button"
                    className="action secondary"
                    disabled={busy || selected.status === "accepted"}
                    onClick={() => void review("accept")}
                  >
                    {selected.status === "accepted"
                      ? "Accepted"
                      : "Accept shot"}
                    <span className="shortcut">A</span>
                  </button>
                </form>
                <p id="review-scope" className="review-scope">
                  {source.kind === "cached"
                    ? "Reviews stay in this browser."
                    : "Your note guides future shots."}
                </p>
                {selected.status !== "pending" ? (
                  <div className="saved-review">
                    <Icon
                      name={selected.status === "accepted" ? "check" : "flag"}
                      size={14}
                    />
                    <span>
                      {selected.status === "accepted"
                        ? "Accepted take"
                        : (selected.rejectReason ?? "Correction noted")}
                    </span>
                  </div>
                ) : null}
              </aside>
            </section>
            <section
              className="filmstrip-region"
              aria-label={`Batch ${activeBatch?.index ?? 1} shots`}
            >
              <div className="filmstrip-heading">
                <span className="film-label">SIX SHOTS. ONE CHARACTER.</span>
                <span>
                  Choose a frame <Icon name="arrow" size={13} />
                </span>
              </div>
              <div
                className="filmstrip"
                role="group"
                tabIndex={0}
                aria-label="Six recorded frames; scroll horizontally"
              >
                {activeShots.map((shot, index) => (
                  <ShotCard
                    key={shot.id}
                    shot={shot}
                    index={index}
                    selected={shot.id === selected.id}
                    onSelect={() => selectShot(shot.id)}
                    animate={shot.batchId === newBatchId}
                    animationIndex={index}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="first-take">
            <div className="first-reference">
              <ShotImage
                src={character?.referenceImageUrl ?? "/seed/mara-reference.png"}
                alt="Mara canonical character reference"
              />
              <span className="film-label">CHARACTER REFERENCE</span>
            </div>
            <div>
              <span className="overline">READY WHEN YOU ARE</span>
              <h2>
                Let’s keep
                <br />
                the story straight.
              </h2>
              <p>
                {source.kind === "unavailable"
                  ? "The recorded reel isn’t available yet."
                  : generating
                    ? "Bringing the first take on set…"
                    : "Six shots. A second pair of eyes."}
              </p>
              <button
                className="action primary"
                disabled={busy || !data || source.kind === "unavailable"}
                onClick={() => void generate()}
              >
                {generating
                  ? "Loading the take…"
                  : source.kind === "cached"
                    ? "Load first take"
                    : "Generate first take"}
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </section>
        )}
        {generating && allShots.length ? (
          <div className="generation-status" role="status">
            <span className="loading-dot" />
            {source.kind === "cached"
              ? "Loading recorded shots…"
              : `${savedGenerationShots}/6 frames saved. Still rolling.`}
          </div>
        ) : null}
        {notice ? (
          <div
            className={`set-notice ${newRuleId ? "rule-notice" : ""}`}
            role="status"
          >
            <Icon name={newRuleId ? "spark" : "check"} size={16} />
            {notice}
            {newRuleId ? (
              <button onClick={() => memoryDialogRef.current?.showModal()}>
                View memory <Icon name="arrow" size={13} />
              </button>
            ) : null}
          </div>
        ) : null}
        <footer className="studio-footer">
          <span>
            {source.kind === "cached"
              ? "Recorded results stay unchanged."
              : "Keep the story straight."}
          </span>
          <a className="quiet-link" href="/learning">
            View the learning <Icon name="arrow" size={14} />
          </a>
        </footer>
      </main>
      <dialog
        className="memory-dialog"
        ref={memoryDialogRef}
        aria-labelledby="memory-title"
      >
        <div className="dialog-heading">
          <h2 id="memory-title">Scripty Memory</h2>
          <button
            className="icon-action"
            onClick={() => memoryDialogRef.current?.close()}
            aria-label="Close memory"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="memory-content">
          <p className="drawer-lead">Production notes. Kept.</p>
          <div className="learned-heading">
            {learned.length} learned {learned.length === 1 ? "rule" : "rules"}
          </div>
          {learned.length ? (
            learned.map((rule) => {
              const reach = correctionReach(rule, allShots);
              const recorded = recordedRuleIds.has(rule.id);
              return (
                <article
                  className={`memory-rule ${rule.id === newRuleId ? "rule-arrived" : ""}`}
                  key={rule.id}
                >
                  <Icon name="spark" size={17} />
                  <p>{rule.text}</p>
                  <span>
                    {source.kind === "cached"
                      ? recorded
                        ? "Recorded memory"
                        : "This browser’s correction"
                      : "Learned from review"}
                  </span>
                  <span>
                    {reach
                      ? `Applied in ${reach} ${recorded ? "recorded " : ""}shots`
                      : source.kind === "cached"
                        ? "Not applied to recorded shots"
                        : "Ready for the next take"}
                  </span>
                  <details>
                    <summary>Rule provenance</summary>
                    <code>{rule.id}</code>
                    <p>{rule.timesApplied} batch applications</p>
                  </details>
                </article>
              );
            })
          ) : (
            <p className="subtle-empty">Your first correction goes here.</p>
          )}
          <section className="character-memory">
            <span className="film-label">CHARACTER CANON</span>
            <div className="memory-reference">
              <ShotImage
                src={character?.referenceImageUrl ?? "/seed/mara-reference.png"}
                alt="Mara canonical reference"
              />
            </div>
            <h3>{character?.name ?? "Mara"}</h3>
            <dl>
              {character?.attributes.map((attribute) => (
                <div key={attribute.key}>
                  <dt>{attribute.label}</dt>
                  <dd>{attribute.expected}</dd>
                </div>
              ))}
            </dl>
            <p>Anatomical sides, not viewer sides.</p>
          </section>
          <details className="seed-rules">
            <summary>Character-sheet rules</summary>
            {data?.rules
              .filter((rule) => rule.source === "seed")
              .map((rule) => (
                <p key={rule.id}>{rule.text}</p>
              ))}
          </details>
        </div>
      </dialog>
      <dialog
        className="evidence-dialog"
        ref={evidenceDialogRef}
        aria-labelledby="evidence-title"
      >
        <div className="dialog-heading">
          <div>
            <span className="overline">THE RECORD</span>
            <h2 id="evidence-title">What carried forward.</h2>
          </div>
          <button
            className="icon-action"
            onClick={() => evidenceDialogRef.current?.close()}
            aria-label="Close evidence"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="evidence-body">
          {archive ? (
            <>
              <div className="evidence-intro">
                <h3>
                  Correction <span>→</span> Memory <span>→</span> Next take.
                </h3>
                <p>
                  The ring rule reached {archive.applications} later recorded
                  prompts and checks.
                </p>
              </div>
              <details className="recorded-rule-proof">
                <summary>Follow the recorded rule</summary>
                <blockquote>{archive.learnedRule}</blockquote>
                <code>{archive.ruleId}</code>
                <p>
                  Exact rule text in {archive.applications} later prompts; the
                  same rule ID in their monitor checks.
                </p>
              </details>
              <div className="comparison-pair">
                <figure>
                  <ShotImage
                    src={archive.firstImage}
                    alt="Baseline close-up with a recorded ring-side finding"
                  />
                  <figcaption>
                    Batch 01 <span>2/6 flagged</span>
                  </figcaption>
                </figure>
                <figure>
                  <ShotImage
                    src={archive.latestImage}
                    alt="Mara in a different scene in latest batch four"
                  />
                  <figcaption>
                    Latest · Batch 04 <span>1/6 flagged</span>
                  </figcaption>
                </figure>
              </div>
              <p className="comparison-note">
                Different scenes. Recorded results; settings changed.
              </p>
              <table className="results-table">
                <caption>Four recorded batches · final checker v3</caption>
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Flagged shots</th>
                    <th>Uncertain checks</th>
                  </tr>
                </thead>
                <tbody>
                  {archive.takes.map((take) => (
                    <tr key={take.index}>
                      <th>{number(take.index)}</th>
                      <td>
                        {take.flagged}/{take.shots}
                      </td>
                      <td>
                        {take.uncertain}/{take.checks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <details className="study-notes">
                <summary>Study notes & limits</summary>
                <ul>
                  <li>These flags do not verify image improvement.</li>
                  <li>
                    Generator, quality, style and scenes changed after batch 1.
                  </li>
                  <li>
                    Baseline is a disclosed v3 recheck; v1/v2 flagged 6/6.
                  </li>
                  <li>Learned rules also added monitor checks.</li>
                  <li>The final rate rose from 0/6 to 1/6.</li>
                  <li>Human-verified labels: pending.</li>
                  <li>
                    The last scar-side flag may itself be a checker error.
                  </li>
                  <li>
                    Markers are editor-positioned, not automated localization.
                  </li>
                </ul>
              </details>
            </>
          ) : null}
          {selected ? (
            <section className="selected-evidence">
              <h3>Selected frame</h3>
              <p className="film-label">
                BATCH {number(selectedBatch?.index ?? 1)} /{" "}
                {selected.scenePrompt}
              </p>
              <CheckList shot={selected} character={character} />
              <details>
                <summary>Generation context</summary>
                <pre>{selected.finalPrompt}</pre>
                <p className="evidence-caption">
                  {source.kind === "cached"
                    ? "Recorded engine prompt · local replay edits do not rewrite it."
                    : "Current generation prompt"}
                </p>
              </details>
            </section>
          ) : null}
          <details className="trace-details">
            <summary>
              Trace log <span>{data?.traces.length ?? 0} events</span>
            </summary>
            <div className="trace-events">
              {(data?.traces ?? []).toReversed().map((trace) => (
                <article key={trace.id}>
                  <time dateTime={trace.createdAt}>
                    {captureTime(trace.createdAt)}
                  </time>
                  <span
                    className={
                      trace.type.startsWith("rule")
                        ? "memory-text"
                        : trace.type === "flag"
                          ? "drift-text"
                          : ""
                    }
                  >
                    {humanize(trace.type)}
                  </span>
                  <p>{trace.message}</p>
                  {trace.shotId ? (
                    <button
                      onClick={() => {
                        selectShot(trace.shotId!);
                        evidenceDialogRef.current?.close();
                      }}
                    >
                      View frame <Icon name="arrow" size={13} />
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </details>
          <p className="evidence-caption">
            Project memory and prompt adaptation. Model weights stay fixed.
          </p>
        </div>
      </dialog>
      <dialog
        className="frame-dialog"
        ref={previewDialogRef}
        aria-labelledby="frame-dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <h2 id="frame-dialog-title">Full frame</h2>
            <p>{selected?.scenePrompt}</p>
          </div>
          <button
            className="icon-action"
            onClick={() => previewDialogRef.current?.close()}
            aria-label="Close full frame preview"
          >
            <Icon name="close" />
          </button>
        </div>
        {selected ? (
          <ShotImage
            src={selected.imageUrl}
            alt={`Full frame: ${selected.scenePrompt}`}
            priority
          />
        ) : null}
      </dialog>
    </div>
  );
}
function preferredShot(shots: Shot[], batches: Batch[]): Shot | undefined {
  const latest = [...batches]
    .filter((batch) => shots.some((shot) => shot.batchId === batch.id))
    .sort((a, b) => b.index - a.index)[0];
  const current = latest
    ? shots.filter((shot) => shot.batchId === latest.id)
    : shots;
  return (
    current.find(
      (shot) =>
        shot.id === "1fc48122-2b25-4841-b588-5554298bd339" && shot.flagged,
    ) ??
    current.find((shot) => shot.flagged) ??
    current[0]
  );
}
function findingTitle(key: string) {
  return (
    {
      scarf_color: "Scarf color changed?",
      scar_side: "Scar side changed?",
      ring_hand: "Ring on the wrong hand?",
      hair: "Hair changed?",
    }[key] ?? "Something slipped."
  );
}
function recordedMarker(id: string, key: string) {
  // Curated pointers for these exact recorded images; no invented localization on new shots.
  if (id === "1fc48122-2b25-4841-b588-5554298bd339" && key === "ring_hand")
    return {
      x: 0.61,
      y: 0.72,
      width: 0.12,
      height: 0.15,
      label: "Ring hand?",
      asset: "/design/ring-annotation.svg",
    };
  if (
    id === "46bebc3e-533f-4806-82ac-b625abb76114" &&
    (key === "scar_side" || key === "rule:seed-scar")
  )
    return {
      x: 0.49,
      y: 0.2,
      width: 0.1,
      height: 0.12,
      label: "Scar side?",
      asset: "/design/eye-annotation.svg",
    };
  return null;
}
function CheckList({
  shot,
  character,
}: {
  shot: Shot;
  character?: Project["characters"][number];
}) {
  return (
    <div className="checks-list">
      {shot.checks.map((check) => {
        const unclear =
          check.confidence < 0.6 || check.observed.toLowerCase() === "unclear";
        return (
          <div
            className={`check-row ${unclear ? "is-uncertain" : check.pass ? "is-pass" : "is-drift"}`}
            key={check.key}
          >
            <div className="check-top">
              <strong>
                {character?.attributes.find(
                  (attribute) => attribute.key === check.key,
                )?.label ??
                  (check.key.startsWith("rule:")
                    ? "Memory rule"
                    : humanize(check.key))}
              </strong>
              <span>
                {unclear ? "? Uncertain" : check.pass ? "✓ Pass" : "! Drift"}
              </span>
            </div>
            <dl>
              <div>
                <dt>Expected</dt>
                <dd>{check.expected}</dd>
              </div>
              <div>
                <dt>Observed</dt>
                <dd>{check.observed}</dd>
              </div>
            </dl>
            <span className="check-confidence">
              {pct(check.confidence)} model confidence
            </span>
            {check.key.startsWith("rule:") ? (
              <code className="check-rule-id">{check.key.slice(5)}</code>
            ) : null}
            {check.note ? <p>{check.note}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
function ShotCard({
  shot,
  index,
  selected,
  onSelect,
  animate,
  animationIndex,
}: {
  shot: Shot;
  index: number;
  selected: boolean;
  onSelect: () => void;
  animate: boolean;
  animationIndex: number;
}) {
  const unclear = uncertain(shot);
  return (
    <button
      className={`shot-card ${selected ? "selected" : ""} ${shot.flagged ? "flagged" : ""} ${animate ? "shot-arrived" : ""}`}
      style={{ animationDelay: `${animationIndex * 20}ms` }}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Frame ${index + 1}. ${shot.flagged ? "Continuity drift" : unclear ? "Uncertain" : "No drift flagged"}. ${shot.status}. ${shot.scenePrompt}`}
    >
      <div className="shot-thumbnail">
        <ShotImage src={shot.imageUrl} alt={shot.scenePrompt} />
        {shot.status !== "pending" ? (
          <span className="thumbnail-review">
            {shot.status === "accepted" ? "✓" : "−"}
          </span>
        ) : null}
      </div>
      <div className="shot-caption">
        <span>FR {number(index + 1)}</span>
        <span className={shot.flagged ? "drift-text" : ""}>
          {shot.flagged ? "! Drift" : unclear ? "? Uncertain" : "✓ Checked"}
        </span>
      </div>
    </button>
  );
}
