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
  scenePrompts?: string[];
  generationEnabled?: boolean;
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
type View =
  | "batch"
  | "review"
  | "learned"
  | "progress"
  | "comparison"
  | "capacity"
  | "failed"
  | "scenes"
  | "character"
  | "canon";
export function ScriptyStudio({
  archive,
  initialEvidence = false,
  productionId = "mara",
  startOnReady = false,
}: {
  archive?: ArchiveEvidence;
  initialEvidence?: boolean;
  productionId?: string;
  startOnReady?: boolean;
}) {
  const isSample = productionId === "mara";
  const [editDraft, setEditDraft] = useState<{
    name: string;
    attributes: Project["characters"][number]["attributes"];
    referenceTicket?: string;
    preview: string;
  } | null>(null);
  const [editDetail, setEditDetail] = useState("");
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<ProjectData | null>(null),
    [loading, setLoading] = useState(true),
    [view, setView] = useState<View>(initialEvidence ? "progress" : "batch"),
    [activeId, setActiveId] = useState<string | null>(null),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [generating, setGenerating] = useState(false),
    [reviewing, setReviewing] = useState(false),
    [error, setError] = useState(""),
    [savedRule, setSavedRule] = useState<Rule | null>(null),
    [sceneInput, setSceneInput] = useState("");
  const memoryRef = useRef<HTMLDialogElement>(null),
    evidenceRef = useRef<HTMLDetailsElement>(null),
    headingRef = useRef<HTMLHeadingElement>(null),
    originShotRef = useRef<string | null>(null),
    startedRef = useRef(false),
    sceneLoadedRef = useRef(false),
    reviewActionRef = useRef<(decision: "accept" | "reject") => Promise<void>>(
      async () => {},
    );
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const incoming = await api<ProjectData>(
        isSample
          ? "/api/productions/sample"
          : `/api/project/${encodeURIComponent(productionId)}`,
        { signal },
      );
      if (
        !incoming.project ||
        !Array.isArray(incoming.shots) ||
        !Array.isArray(incoming.batches) ||
        !Array.isArray(incoming.rules) ||
        !Array.isArray(incoming.traces)
      )
        throw new Error("This production could not be opened.");
      if (signal?.aborted) return;
      setData((previous) => mergeData(previous, incoming));
      setActiveId(
        (previous) =>
          previous ??
          [...incoming.batches].sort((a, b) => b.index - a.index)[0]?.id ??
          null,
      );
      if (!sceneLoadedRef.current && incoming.scenePrompts) {
        setSceneInput(incoming.scenePrompts.join("\n"));
        sceneLoadedRef.current = true;
      }
    },
    [isSample, productionId],
  );
  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("This production could not be opened.");
          setView("failed");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refresh]);
  const batches = [...(data?.batches ?? [])].sort((a, b) => a.index - b.index),
    allShots = data?.shots ?? [],
    active = batches.find((batch) => batch.id === activeId) ?? batches.at(-1),
    shots = allShots.filter((shot) => shot.batchId === active?.id),
    flagged = shots.filter((shot) => shot.flagged),
    queue = flagged.filter((shot) => shot.status === "pending"),
    selected = allShots.find((shot) => shot.id === selectedId),
    character = data?.project.characters[0],
    learned = (data?.rules ?? []).filter((rule) => rule.source !== "seed"),
    busy = generating || reviewing;
  const title = data?.project.name ?? (isSample ? "Mara" : "Production");
  useEffect(() => {
    document.title = `${title} — ${isSample ? "Sample production · " : ""}${view === "review" ? "Review" : view === "progress" ? "Progress" : view === "learned" ? "Noted" : "Shots"}`;
  }, [title, isSample, view]);
  useEffect(() => {
    if (view === "batch" && originShotRef.current) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLButtonElement>(
            `[data-shot-id="${originShotRef.current}"]`,
          )
          ?.focus({ preventScroll: true }),
      );
    } else headingRef.current?.focus({ preventScroll: true });
  }, [view]);
  useEffect(() => {
    if (
      startOnReady &&
      !loading &&
      data &&
      !isSample &&
      !data.shots.length &&
      !startedRef.current
    ) {
      startedRef.current = true;
      const location = new URL(window.location.href);
      location.searchParams.delete("start");
      window.history.replaceState(null, "", location);
      if (data.generationEnabled === false) setView("capacity");
      else void generate();
    }
  }, [startOnReady, loading, data, isSample]);
  useEffect(() => {
    if (!generating || isSample) return;
    const controller = new AbortController();
    let pending = false;
    const timer = setInterval(() => {
      if (pending) return;
      pending = true;
      void refresh(controller.signal)
        .catch(() => {})
        .finally(() => {
          pending = false;
        });
    }, 4000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [generating, isSample, refresh]);
  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if (
        document.querySelector("dialog[open]") ||
        event.defaultPrevented ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          /INPUT|TEXTAREA|SELECT/.test(target.tagName))
      )
        return;
      if (event.key === "Escape" && view !== "batch") {
        event.preventDefault();
        back();
      }
      if (view === "review" && ["a", "r"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        void reviewActionRef.current(
          event.key.toLowerCase() === "a" ? "accept" : "reject",
        );
      }
    }
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [view]);
  function back() {
    setError("");
    if (view === "character" || view === "canon") {
      setView("batch");
      requestAnimationFrame(() => memoryRef.current?.showModal());
      return;
    }
    setView("batch");
  }
  function openShot(shot: Shot) {
    setActiveId(shot.batchId);
    originShotRef.current = shot.id;
    setSelectedId(shot.id);
    setError("");
    setView("review");
  }
  async function generate() {
    if (!data || busy || isSample) return;
    setGenerating(true);
    setError("");
    setView("batch");
    try {
      const scenePrompts = parseScenePrompts(sceneInput);
      const result = await api<BatchResponse>("/api/batch", {
        method: "POST",
        body: JSON.stringify({
          projectId: productionId,
          ...(scenePrompts ? { scenePrompts } : {}),
        }),
      });
      if (!result.batch || !Array.isArray(result.shots))
        throw new Error("The take could not be completed.");
      setData((current) =>
        current
          ? {
              ...current,
              ...result,
              batches: mergeById(current.batches, [result.batch]),
              shots: mergeById(current.shots, result.shots),
            }
          : current,
      );
      setActiveId(result.batch.id);
      await refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "That take did not land.";
      setError(message);
      setView(
        /breather|paused|capacity|getting ready|allowance/i.test(message)
          ? "capacity"
          : "failed",
      );
      try {
        await refresh();
      } catch {}
    } finally {
      setGenerating(false);
    }
  }
  async function saveReview(decision: "accept" | "reject") {
    if (!selected || busy) return;
    setReviewing(true);
    setError("");
    try {
      const reason = proposedCorrection(selected, character);
      const result = await api<ReviewResponse>(
        `/api/shot/${encodeURIComponent(selected.id)}/review`,
        {
          method: "POST",
          body: JSON.stringify({
            decision,
            ...(!isSample ? { projectId: productionId } : {}),
            ...(decision === "reject" ? { reason } : {}),
          }),
        },
      );
      if (!result.shot) throw new Error("No saved review");
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
      if (result.newRule) {
        setSavedRule(result.newRule);
        setView("learned");
      } else back();
      try {
        await refresh();
      } catch {}
    } catch {
      setError("Couldn't save that note. Try again.");
    } finally {
      setReviewing(false);
    }
  }
  reviewActionRef.current = saveReview;
  function advance() {
    if (queue.length) {
      openShot(queue[0]);
      return;
    }
    if (isSample) {
      const next = batches.find((batch) => batch.index > (active?.index ?? 0));
      if (next) {
        setActiveId(next.id);
        setView("batch");
      } else setView("capacity");
    } else void generate();
  }
  async function editUpload(file: File) {
    if (editing) return;
    setEditing(true);
    setError("");
    try {
      const form = new FormData();
      form.set("reference", file);
      const response = await fetch("/api/productions/reference/upload", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(45000),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error();
      setEditDraft((draft) =>
        draft
          ? {
              ...draft,
              referenceTicket: payload.ticket,
              preview: payload.imageUrl,
            }
          : draft,
      );
    } catch {
      setError("That image didn't load. Choose another.");
    } finally {
      setEditing(false);
    }
  }
  async function saveCharacter() {
    if (!editDraft || editing) return;
    setEditing(true);
    setError("");
    try {
      const attributes = [
        ...editDraft.attributes,
        ...(editDetail.trim()
          ? [
              {
                key: `canon_${crypto.randomUUID()}`,
                label: editDetail.trim(),
                expected: editDetail.trim(),
                weight: 1,
              },
            ]
          : []),
      ];
      if (
        !editDraft.name.trim() ||
        !attributes.length ||
        attributes.some((attribute) => !attribute.expected.trim())
      )
        throw new Error();
      await api(`/api/productions/${productionId}`, {
        method: "PATCH",
        body: JSON.stringify({
          character: {
            name: editDraft.name,
            attributes: attributes.map((attribute) => ({
              ...attribute,
              weight: 1,
            })),
            ...(editDraft.referenceTicket
              ? { referenceTicket: editDraft.referenceTicket }
              : {}),
          },
        }),
      });
      await refresh();
      setSavedRule(null);
      setEditDraft(null);
      setEditDetail("");
      setView("batch");
      requestAnimationFrame(() => memoryRef.current?.showModal());
    } catch {
      setError("Couldn't save those changes. Try again.");
    } finally {
      setEditing(false);
    }
  }
  const editDirty =
    !!editDraft &&
    !!character &&
    (editDraft.name !== character.name ||
      !!editDraft.referenceTicket ||
      !!editDetail.trim() ||
      JSON.stringify(editDraft.attributes) !==
        JSON.stringify(character.attributes));
  function closeMemory() {
    const dialog = memoryRef.current;
    if (!dialog || dialog.dataset.closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }
    dialog.dataset.closing = "true";
    setTimeout(() => {
      dialog.close();
      delete dialog.dataset.closing;
    }, 200);
  }
  const metrics = batches.map((batch) => {
    const items = allShots.filter((shot) => shot.batchId === batch.id);
    return {
      index: batch.index,
      id: batch.id,
      shots: items.length,
      flagged: items.filter((shot) => shot.flagged).length,
      complete: batchEvidence(items).complete,
    };
  });
  const showNav = ![
    "review",
    "learned",
    "capacity",
    "failed",
    "scenes",
    "character",
    "canon",
  ].includes(view);
  return (
    <div className="production-app">
      {showNav ? (
        <header className="production-header">
          <a href="/" className="wordmark">
            scripty
          </a>
          <nav aria-label="Production">
            <button onClick={() => memoryRef.current?.showModal()}>
              Memory
            </button>
            <button
              onClick={() => setView("progress")}
              aria-current={view === "progress" ? "page" : undefined}
            >
              Progress
            </button>
          </nav>
        </header>
      ) : null}
      <div className="sr-only" role="status" aria-live="polite">
        {reviewing
          ? "Saving the production note."
          : generating
            ? "Checking the next take."
            : view === "learned"
              ? "Production note saved."
              : ""}
      </div>
      {view === "batch" ? (
        <main className="batch-screen page-grid">
          <h1 ref={headingRef} tabIndex={-1}>
            {loading
              ? "Checking your shots."
              : !shots.length && !generating
                ? "Your first take starts here."
                : `${flagged.length} of ${shots.length || 6} shots ${flagged.length === (shots.length || 6) ? "need review" : "drifted"}.`}
          </h1>
          {loading || generating ? (
            <div
              className="batch-grid"
              aria-busy="true"
              aria-label="Checking shots"
            >
              {Array.from({ length: 6 }, (_, i) =>
                shots[i] ? (
                  <ShotTile
                    key={i}
                    shot={shots[i]}
                    index={i}
                    onClick={() => openShot(shots[i])}
                  />
                ) : (
                  <div className="shot-skeleton" key={i} />
                ),
              )}
            </div>
          ) : shots.length ? (
            <div className="batch-grid">
              {shots.map((shot, index) => (
                <ShotTile
                  key={shot.id}
                  shot={shot}
                  index={index}
                  onClick={() => openShot(shot)}
                />
              ))}
            </div>
          ) : null}
          {!loading ? (
            <button
              className="pill primary batch-action"
              disabled={busy}
              onClick={() => (shots.length ? advance() : setView("scenes"))}
            >
              {generating
                ? "Checking shots…"
                : !shots.length
                  ? "Add scenes"
                  : queue.length === 1
                    ? "Review it"
                    : queue.length > 1
                      ? "Review them"
                      : "Review next take"}
            </button>
          ) : null}
        </main>
      ) : null}
      {view === "review" && selected ? (
        <main className="review-screen">
          <div className="review-bed">
            <div className="source-frame">
              <ShotImage
                src={selected.imageUrl}
                alt={selected.scenePrompt}
                priority
              />
              {markerFor(selected) ? (
                <DriftMark marker={markerFor(selected)!} />
              ) : null}
            </div>
          </div>
          <h1 className="review-sentence" ref={headingRef} tabIndex={-1}>
            {reviewSentence(selected, character)}
          </h1>
          {error ? (
            <p className="plain-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="review-actions">
            <button
              className="pill primary reject-action"
              onClick={() => void saveReview("reject")}
              disabled={busy}
            >
              {reviewing
                ? "Saving…"
                : error
                  ? "Try again"
                  : "Reject & remember"}
              <span className="key-hint">R</span>
            </button>
            <button
              className="pill secondary accept-action"
              onClick={() => void saveReview("accept")}
              disabled={busy}
            >
              Looks right<span className="key-hint">A</span>
            </button>
          </div>
        </main>
      ) : null}
      {view === "learned" && savedRule ? (
        <main className="learned-screen">
          <h1 ref={headingRef} tabIndex={-1}>
            Noted. On the next take.
          </h1>
          <div className="learned-rule" key={savedRule.id}>
            <p>{savedRule.text}</p>
          </div>
          <button className="pill primary" onClick={back}>
            Back to shots
          </button>
        </main>
      ) : null}
      {view === "progress" ? (
        <main className="progress-screen page-grid">
          <h1 ref={headingRef} tabIndex={-1}>
            Shots flagged, take by take.
          </h1>
          <div
            className="progress-chart"
            aria-label="Original monitor flags per take"
          >
            {metrics.map((take) => (
              <button
                className="take-column"
                key={take.id}
                onClick={() => {
                  setActiveId(take.id);
                  setView("batch");
                }}
                aria-label={`Take ${take.index}: ${take.flagged} of ${take.shots} shots flagged${take.complete ? "" : ", incomplete evidence"}. Open shots.`}
              >
                <strong>
                  {take.complete ? `${take.flagged}/${take.shots}` : "—"}
                </strong>
                {take.complete && take.flagged > 0 ? (
                  <span
                    className="take-bar"
                    style={{ height: `${take.flagged * 96}px` }}
                  />
                ) : null}
                <span>Take {take.index}</span>
              </button>
            ))}
          </div>
          <p className="progress-qualifier">
            Models, scenes and checks changed. Human verification pending.
          </p>
          <button className="pill primary progress-back" onClick={back}>
            Back to shots
          </button>
          <details
            className="progress-evidence"
            ref={evidenceRef}
            open={initialEvidence || undefined}
          >
            <summary>Evidence</summary>
            <p>
              {isSample
                ? "Sample production: original images, prompts and checks. Your reviews stay in this browser and do not rewrite its history."
                : "Production memory adapts prompts and checks. Model weights stay fixed."}
            </p>
            {archive ? (
              <>
                <p>
                  Original take1 was rechecked with frozen checker v3; v1/v2
                  each flagged6/6. Generator, quality, style and scenes changed.
                  Take4 added an accepted reference. Human-verified accuracy and
                  causal visual improvement remain unavailable.
                </p>
                <table>
                  <caption>Uncertain checks, not confident failures</caption>
                  <tbody>
                    {archive.takes.map((take) => (
                      <tr key={take.index}>
                        <th>Take {take.index}</th>
                        <td>
                          {take.uncertain}/{take.checks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>
                  The ring rule reached {archive.applications} later original
                  prompts and checks.
                </p>
                <blockquote>{archive.learnedRule}</blockquote>
                <code>{archive.ruleId}</code>
                <button
                  className="pill secondary"
                  onClick={() => setView("comparison")}
                >
                  Compare Take 1 and Take 3
                </button>
              </>
            ) : null}
            <details>
              <summary>Rules and application evidence</summary>
              {learned.map((rule) => (
                <article className="rule-proof" key={rule.id}>
                  <p>{rule.text}</p>
                  <code>{rule.id}</code>
                  <p>
                    {correctionReach(rule, allShots)} original prompts and
                    checks match this rule.
                  </p>
                </article>
              ))}
            </details>
            <details>
              <summary>Original shot evidence</summary>
              {allShots.map((shot) => (
                <article className="shot-proof" key={shot.id}>
                  <button onClick={() => openShot(shot)}>
                    {shot.scenePrompt}
                  </button>
                  <ul>
                    {shot.checks.map((check) => (
                      <li key={check.key}>
                        <strong>
                          {humanize(
                            check.key.startsWith("rule:")
                              ? "Memory rule"
                              : check.key,
                          )}
                        </strong>
                        <p>Expected: {check.expected}</p>
                        <p>Observed: {check.observed}</p>
                        <p>
                          {check.confidence < 0.6 ||
                          check.observed.toLowerCase() === "unclear"
                            ? "Uncertain"
                            : check.pass
                              ? "Monitor pass"
                              : "Monitor flag"}{" "}
                          · {pct(check.confidence)} model-reported confidence
                        </p>
                        {check.key.startsWith("rule:") ? (
                          <code>{check.key.slice(5)}</code>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <details>
                    <summary>Generation context</summary>
                    <pre>{shot.finalPrompt}</pre>
                  </details>
                </article>
              ))}
            </details>
            <details>
              <summary>Production trace</summary>
              {data?.traces.map((trace) => (
                <article className="trace-proof" key={trace.id}>
                  <strong>{humanize(trace.type)}</strong>
                  <p>{trace.message}</p>
                </article>
              ))}
            </details>
          </details>
        </main>
      ) : null}
      {view === "comparison" && archive ? (
        <>
          <main className="comparison-screen page-grid">
            <h1 ref={headingRef} tabIndex={-1}>
              Same character. New scene.
            </h1>
            <div className="comparison-images">
              <figure>
                <ShotImage
                  src={archive.firstImage}
                  alt="Mara in original Take 1"
                  priority
                />
                <figcaption>Take 1</figcaption>
              </figure>
              <figure>
                <div className="comparison-reveal">
                  <ShotImage
                    src={archive.heroImage}
                    alt="Mara in original Take 3"
                    priority
                  />
                </div>
                <figcaption>Take 3</figcaption>
              </figure>
            </div>
            <button className="pill primary" onClick={back}>
              Back to shots
            </button>
          </main>
        </>
      ) : null}
      {view === "capacity" ? (
        <main className="capacity-screen">
          <a href="/" className="wordmark">
            scripty
          </a>
          <div>
            <h1 ref={headingRef} tabIndex={-1}>
              {isSample ? "Your notes are saved." : "Your production is saved."}
            </h1>
            <p>New takes are paused. Mara is ready.</p>
            <a
              className="pill primary"
              href="/studio"
              onClick={(event) => {
                if (isSample && batches.length) {
                  event.preventDefault();
                  setActiveId(batches[0].id);
                  back();
                }
              }}
            >
              Explore a sample production: Mara
            </a>
          </div>
        </main>
      ) : null}
      {view === "failed" ? (
        <main className="failure-screen">
          <a href="/" className="wordmark">
            scripty
          </a>
          <div>
            <h1 ref={headingRef} tabIndex={-1}>
              That take didn't land.
            </h1>
            <p>
              {data
                ? "Your production is safe. Try again."
                : error || "Your entries are still here. Try again."}
            </p>
            <button
              className="pill primary"
              onClick={() => {
                if (data && !isSample) void generate();
                else {
                  setLoading(true);
                  setView("batch");
                  void refresh()
                    .catch(() => setView("failed"))
                    .finally(() => setLoading(false));
                }
              }}
            >
              Try again
            </button>
            <a className="pill secondary" href="/studio">
              Explore a sample production: Mara
            </a>
          </div>
        </main>
      ) : null}
      {view === "scenes" ? (
        <main className="scene-screen">
          <header className="brand-header">
            <a href="/" className="wordmark">
              scripty
            </a>
          </header>
          <div>
            <h1 ref={headingRef} tabIndex={-1}>
              What happens in this take?
            </h1>
            <p>Write one scene per line.</p>
            <label className="sr-only" htmlFor="production-scenes">
              Six scene prompts
            </label>
            <textarea
              id="production-scenes"
              value={sceneInput}
              onChange={(event) => setSceneInput(event.target.value)}
              rows={6}
            />
            {error ? <p role="alert">{error}</p> : null}
            <button
              className="pill primary"
              disabled={busy}
              onClick={async () => {
                try {
                  const scenePrompts = parseScenePrompts(sceneInput);
                  if (!scenePrompts)
                    throw new Error("Write six scenes, one per line.");
                  await api(`/api/productions/${productionId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ scenePrompts }),
                  });
                  if (data?.generationEnabled === false) setView("capacity");
                  else await generate();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Your scenes could not be saved.",
                  );
                }
              }}
            >
              Generate
            </button>
          </div>
        </main>
      ) : null}
      {(view === "character" || view === "canon") && editDraft ? (
        <section className="setup-app">
          <header className="brand-header">
            <a href="/" className="wordmark">
              scripty
            </a>
          </header>
          <main className="setup-main">
            <h1 ref={headingRef} tabIndex={-1}>
              {view === "character"
                ? "Your character."
                : "What must stay the same?"}
            </h1>
            {view === "character" ? (
              <div className="setup-column">
                <label className="sr-only" htmlFor="edit-character-name">
                  Character name
                </label>
                <input
                  id="edit-character-name"
                  value={editDraft.name}
                  maxLength={80}
                  onChange={(event) =>
                    setEditDraft({ ...editDraft, name: event.target.value })
                  }
                />
                <label
                  className="upload-bed"
                  htmlFor="edit-character-reference"
                >
                  <img
                    src={editDraft.preview}
                    alt={`${editDraft.name} reference`}
                  />
                  <input
                    id="edit-character-reference"
                    aria-label="Change character reference"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={editing}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void editUpload(file);
                    }}
                  />
                </label>
              </div>
            ) : (
              <div className="setup-wide">
                <div className="canon-fields">
                  {editDraft.attributes.map((attribute, index) => (
                    <div className="canon-field" key={attribute.key}>
                      <label
                        className="sr-only"
                        htmlFor={`edit-attribute-${index}`}
                      >
                        Canon detail {index + 1}
                      </label>
                      <input
                        id={`edit-attribute-${index}`}
                        value={attribute.expected}
                        maxLength={200}
                        onChange={(event) =>
                          setEditDraft({
                            ...editDraft,
                            attributes: editDraft.attributes.map((value, i) =>
                              i === index
                                ? { ...value, expected: event.target.value }
                                : value,
                            ),
                          })
                        }
                      />
                      <button
                        aria-label={`Remove ${attribute.expected}`}
                        onClick={() =>
                          setEditDraft({
                            ...editDraft,
                            attributes: editDraft.attributes.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="sr-only" htmlFor="edit-add-detail">
                  Add a detail
                </label>
                <input
                  id="edit-add-detail"
                  className="canon-add"
                  value={editDetail}
                  placeholder="Add a detail"
                  maxLength={200}
                  onChange={(event) => setEditDetail(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      editDetail.trim() &&
                      editDraft.attributes.length < 12
                    ) {
                      event.preventDefault();
                      setEditDraft({
                        ...editDraft,
                        attributes: [
                          ...editDraft.attributes,
                          {
                            key: `canon_${crypto.randomUUID()}`,
                            label: editDetail.trim(),
                            expected: editDetail.trim(),
                            weight: 1,
                          },
                        ],
                      });
                      setEditDetail("");
                    }
                  }}
                />
              </div>
            )}
            {error ? (
              <p role="alert" className="setup-error">
                {error}
              </p>
            ) : null}
            <button
              className="pill primary setup-continue"
              disabled={
                editing ||
                !editDraft.name.trim() ||
                (view === "canon" &&
                  (!editDirty ||
                    (!editDraft.attributes.length && !editDetail.trim()) ||
                    editDraft.attributes.some(
                      (attribute) => !attribute.expected.trim(),
                    )))
              }
              onClick={() =>
                view === "character" ? setView("canon") : void saveCharacter()
              }
            >
              {editing
                ? "Saving…"
                : view === "character"
                  ? "Continue"
                  : "Save changes"}
            </button>
          </main>
        </section>
      ) : null}
      <dialog
        className="memory-drawer"
        ref={memoryRef}
        aria-labelledby="memory-title"
        onCancel={(event) => {
          event.preventDefault();
          closeMemory();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const box = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < box.left ||
              event.clientX > box.right ||
              event.clientY < box.top ||
              event.clientY > box.bottom
            )
              closeMemory();
          }
        }}
      >
        <h2 id="memory-title">Memory</h2>
        <button
          className="drawer-close"
          aria-label="Close Memory"
          onClick={closeMemory}
        >
          ×
        </button>
        {learned.length ? (
          learned.map((rule) => (
            <div
              className={`drawer-rule ${savedRule?.id === rule.id ? "rule-saved" : ""}`}
              key={rule.id}
            >
              <p>{rule.text}</p>
            </div>
          ))
        ) : (
          <p>Nothing noted yet.</p>
        )}
        <div className="memory-character">
          <div className="reference-bed">
            <ShotImage
              src={
                character?.referenceImageUrl ??
                (isSample ? "/seed/mara-reference.png" : "")
              }
              alt={`${character?.name ?? "Character"} reference`}
            />
          </div>
          <div>
            <h3>{character?.name ?? "Character"}</h3>
            {character?.attributes.slice(0, 3).map((attribute) => (
              <p key={attribute.key}>{attribute.expected}</p>
            ))}
          </div>
        </div>
        {!isSample ? (
          <button
            className="pill primary edit-character"
            onClick={() => {
              memoryRef.current?.close();
              if (character && !editDraft)
                setEditDraft({
                  name: character.name,
                  attributes: character.attributes.map((attribute) => ({
                    ...attribute,
                  })),
                  preview: character.referenceImageUrl,
                });
              setError("");
              setView("character");
            }}
          >
            Edit character
          </button>
        ) : null}
      </dialog>
    </div>
  );
}
function failedCheck(shot: Shot) {
  return shot.checks.find(
    (check) =>
      !check.pass &&
      check.confidence >= 0.6 &&
      check.observed.toLowerCase() !== "unclear",
  );
}
function proposedCorrection(
  shot: Shot,
  character?: Project["characters"][number],
) {
  const check = failedCheck(shot);
  const attribute = character?.attributes.find(
    (item) => item.key === check?.key,
  );
  return check
    ? `${character?.name ?? "The character"}: ${attribute?.label ?? humanize(check.key)} must remain ${check.expected}.`
    : `Keep ${character?.name ?? "the character"} consistent with the character canon.`;
}
function reviewSentence(shot: Shot, character?: Project["characters"][number]) {
  const check = failedCheck(shot);
  if (check?.key === "scar_side" || check?.key === "rule:seed-scar")
    return "Scar seems on her right. Canon says left.";
  if (check?.key === "ring_hand")
    return "Ring seems on her left. Canon says right.";
  if (check) return `${check.observed}. Canon says ${check.expected}.`;
  return uncertain(shot)
    ? "Some details are unclear. Your eye gets the final say."
    : "Looks consistent. Your eye gets the final say.";
}
function markerFor(shot: Shot) {
  if (!shot.flagged) return null;
  if (shot.id === "46bebc3e-533f-4806-82ac-b625abb76114")
    return { x: 0.5125, y: 0.1875, width: 0.1, height: 0.125 };
  if (shot.id === "9986ea9e-1d8f-4afc-a45a-a6631923d8cb")
    return { x: 0.6395833333, y: 0.85625, width: 0.1, height: 0.125 };
  if (shot.id === "1fc48122-2b25-4841-b588-5554298bd339")
    return { x: 0.61, y: 0.72, width: 0.12, height: 0.15 };
  return null;
}
function DriftMark({
  marker,
}: {
  marker: { x: number; y: number; width: number; height: number };
}) {
  return (
    <svg
      className="drift-mark"
      viewBox="0 0 98 82"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        left: `${marker.x * 100}%`,
        top: `${marker.y * 100}%`,
        width: `${marker.width * 100}%`,
        height: `${marker.height * 100}%`,
      }}
    >
      <path
        pathLength="1"
        d="M97 41C97 63.088 75.5131 81 49.0048 81C22.4965 81 1 63.088 1 41C1 18.912 22.4965 1 49.0048 1C75.5131 1 96.9904 18.912 96.9904 40.984"
      />
    </svg>
  );
}
function ShotTile({
  shot,
  index,
  onClick,
}: {
  shot: Shot;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      className="shot-button"
      data-shot-id={shot.id}
      onClick={onClick}
      aria-label={`Shot ${index + 1}. ${shot.flagged ? "Monitor flagged continuity drift" : uncertain(shot) ? "No confident drift flag; some checks uncertain" : "No drift flagged"}. ${shot.status}. ${shot.scenePrompt}`}
    >
      <ShotImage src={shot.imageUrl} alt="" priority />
      <span
        className={`status-dot ${shot.flagged ? "drift" : "clear"}`}
        aria-hidden="true"
      />
      <span className="frame-number">{String(index + 1).padStart(2, "0")}</span>
    </button>
  );
}
