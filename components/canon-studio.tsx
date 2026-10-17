"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Batch, Project, Rule, Shot, TraceEvent } from "@/lib/types";
import { Icon } from "./icons";
import { LearningCurve } from "./learning-curve";
import { ShotImage } from "./shot-image";

type Metadata = { mode?: string; effectiveMode?: string; demoMode?: string; warning?: string; warnings?: string[]; provenance?: unknown };
type ProjectData = Metadata & { project: Project; rules: Rule[]; batches: Batch[]; shots: Shot[]; traces: TraceEvent[] };
type BatchResponse = Metadata & { batch: Batch; shots: Shot[] };
type ReviewResponse = Metadata & { shot: Shot; newRule?: Rule };
const pct = (value: number) => `${Math.round(value * 100)}%`;
const number = (value: number) => String(value).padStart(2, "0");
const humanize = (value: string) => value.replaceAll("_", " ");
const isScaffold = (data: ProjectData) => data.shots.some((shot) => shot.id.startsWith("mock-"));
function mergeById<T extends { id: string }>(previous: T[], incoming: T[]): T[] {
  const values = new Map(previous.map((item) => [item.id, item]));
  for (const item of incoming) values.set(item.id, item);
  return [...values.values()];
}
function mergeData(previous: ProjectData | null, incoming: ProjectData): ProjectData {
  if (!previous) return incoming;
  // TASK 0 returns stateless snapshots. Keep explicit review responses until the real engine is integrated.
  const shots = isScaffold(incoming) ? mergeById(incoming.shots, previous.shots) : mergeById(previous.shots, incoming.shots);
  return { ...previous, ...incoming, shots, rules: mergeById(previous.rules, incoming.rules), batches: mergeById(previous.batches, incoming.batches), traces: mergeById(previous.traces, incoming.traces) };
}
async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const external = options?.signal;
  const abort = () => controller.abort();
  external?.addEventListener("abort", abort, { once: true });
  if (external?.aborted) controller.abort();
  const timeout = setTimeout(abort, options?.method === "POST" ? 190_000 : 20_000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, cache: "no-store", headers: { "Content-Type": "application/json", ...options?.headers } });
    let payload;
    try { payload = await response.json(); } catch { throw new Error("The server returned an unreadable response. Please try again."); }
    if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : `Request failed (${response.status}). Please try again.`);
    return payload as T;
  } catch (error) {
    if (controller.signal.aborted && !external?.aborted) throw new Error("This request took too long. Your existing shots are safe; please try again.");
    throw error;
  } finally { clearTimeout(timeout); external?.removeEventListener("abort", abort); }
}
function passedChecks(shot: Shot) { return shot.checks.filter((check) => check.pass && check.confidence >= 0.6 && check.observed.toLowerCase() !== "unclear").length; }
function uncertain(shot: Shot) { return shot.checks.length === 0 || shot.checks.some((check) => check.confidence < 0.6 || check.observed.toLowerCase() === "unclear"); }
function sourceInfo(data: ProjectData | null) {
  if (!data) return { title: "Connecting", description: "Loading project metadata", kind: "unknown" };
  if (isScaffold(data)) return { title: "Scaffold preview", description: "Illustrative fixture checks · no AI analysis", kind: "cached" };
  const mode = data.effectiveMode ?? data.mode ?? data.demoMode ?? "";
  if (mode.toLowerCase().includes("cached") || mode.toLowerCase().includes("replay")) return { title: "Cached playback", description: "Saved generations and checks · no hidden model requests", kind: "cached" };
  if (mode.toLowerCase().includes("live")) return { title: "Live engine", description: "Generate runs the configured image and monitoring models", kind: "live" };
  return { title: "API connected", description: "Source metadata unavailable · check the trace for provenance", kind: "unknown" };
}
function provenanceText(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return null;
}

export function CanonStudio() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reason, setReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [traceFilter, setTraceFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [newBatchId, setNewBatchId] = useState<string | null>(null);
  const [newRuleId, setNewRuleId] = useState<string | null>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const incoming = await api<ProjectData>("/api/project/mara", { signal });
    if (!incoming.project || !Array.isArray(incoming.shots) || !Array.isArray(incoming.batches) || !Array.isArray(incoming.rules) || !Array.isArray(incoming.traces)) throw new Error("Project data is incomplete. Please reload the project.");
    setData((previous) => mergeData(previous, incoming));
    setSelectedId((previous) => previous ?? incoming.shots.find((shot) => shot.flagged)?.id ?? incoming.shots[0]?.id ?? null);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal).catch((err: unknown) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load the project."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh]);
  const selected = data?.shots.find((shot) => shot.id === selectedId) ?? null;
  const selectedBatch = data?.batches.find((batch) => batch.id === selected?.batchId);
  const selectedUncertain = selected ? uncertain(selected) : false;
  const character = data?.project.characters[0];
  const source = sourceInfo(data);
  const busy = generating || reviewing;
  const batches = [...(data?.batches ?? [])].sort((a, b) => b.index - a.index);
  const allShots = data?.shots ?? [];
  const flagged = allShots.filter((shot) => shot.flagged).length;
  const pending = allShots.filter((shot) => shot.status === "pending").length;
  const learned = (data?.rules ?? []).filter((rule) => rule.source !== "seed");
  const warnings = [...(data?.warnings ?? []), ...(data?.warning ? [data.warning] : [])];

  async function generate() {
    if (busy || !data) return;
    setGenerating(true); setError(null); setNotice(null);
    try {
      const result = await api<BatchResponse>("/api/batch", { method: "POST", body: JSON.stringify({ projectId: data.project.id }) });
      if (!result.batch || !Array.isArray(result.shots)) throw new Error("The batch response was incomplete. Your existing shots are still available.");
      const alreadyExists = dataRef.current?.batches.some((batch) => batch.id === result.batch.id);
      setData((current) => current ? { ...current, ...result, batches: mergeById(current.batches, [result.batch]), shots: alreadyExists && isScaffold(current) ? mergeById(result.shots, current.shots) : mergeById(current.shots, result.shots) } : current);
      setSelectedId(result.shots.find((shot) => shot.flagged)?.id ?? result.shots[0]?.id ?? null);
      setRejectOpen(false); setReason(""); setNewBatchId(result.batch.id);
      setNotice(alreadyExists ? "The API returned the existing batch. No new learning point has been added." : `Batch ${number(result.batch.index)} is ready. ${result.shots.filter((shot) => shot.flagged).length} of ${result.shots.length} shots flagged for review.`);
      try { await refresh(); } catch (err) { setError(`Batch saved, but project refresh failed. ${err instanceof Error ? err.message : "Try refreshing."}`); }
    } catch (err) { setError(err instanceof Error ? err.message : "Could not generate a batch. Please try again."); }
    finally { setGenerating(false); }
  }
  async function review(decision: "accept" | "reject") {
    if (!selected || busy) return;
    if (decision === "reject" && !reason.trim()) { setRejectOpen(true); requestAnimationFrame(() => reasonRef.current?.focus()); return; }
    setReviewing(true); setError(null); setNotice(null);
    try {
      const result = await api<ReviewResponse>(`/api/shot/${encodeURIComponent(selected.id)}/review`, { method: "POST", body: JSON.stringify({ decision, ...(decision === "reject" ? { reason: reason.trim() } : {}) }) });
      if (!result.shot) throw new Error("The review response was incomplete. Please try again.");
      setData((current) => current ? { ...current, ...result, shots: mergeById(current.shots, [result.shot]), rules: result.newRule ? mergeById(current.rules, [result.newRule]) : current.rules } : current);
      if (result.newRule) setNewRuleId(result.newRule.id);
      setNotice(result.newRule ? source.kind === "cached" ? "Rule saved in Canon Memory. Recorded playback stays unchanged; future live generation can apply the correction." : "Review saved. A rule has landed in Canon Memory." : decision === "accept" ? source.kind === "cached" ? "Shot accepted. Review saved; recorded playback stays unchanged." : "Shot accepted. This frame is a positive reference for future generations." : "Rejection saved. See the trace for learning details.");
      setRejectOpen(false); setReason("");
      try { await refresh(); } catch (err) { setError(`Review saved, but project refresh failed. ${err instanceof Error ? err.message : "Try refreshing."}`); }
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save your review. Please try again."); }
    finally { setReviewing(false); }
  }
  const reviewRef = useRef(review);
  reviewRef.current = review;
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey || target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName))) return;
      if (event.key.toLowerCase() === "a") { event.preventDefault(); void reviewRef.current("accept"); }
      if (event.key.toLowerCase() === "r") { event.preventDefault(); void reviewRef.current("reject"); }
      if (event.key === "Escape") { setRejectOpen(false); setTraceOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  function selectShot(id: string) { setSelectedId(id); setRejectOpen(false); setReason(""); }
  async function retry() { setLoading(true); setError(null); try { await refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Could not load project."); } finally { setLoading(false); } }
  const filteredTraces = (data?.traces ?? []).filter((trace) => traceFilter === "all" || traceFilter === "failures" ? traceFilter === "all" || trace.type === "flag" || trace.type === "error" : trace.type === "rule_learned" || trace.type === "rule_applied").toReversed();

  return <div className="studio-shell">
    <a className="skip-link" href="#workbench">Skip to shots</a>
    <header className="topbar"><a href="/" className="brand" aria-label="Canon home"><span className="brand-frame"><Icon name="frame" size={24}/></span>CANON</a><div className="workspace-path"><span className="path-divider"/><span>{data?.project.name ?? "Mara"}</span><Icon name="chevron" size={12}/><span className="muted-text">Continuity workspace</span></div><div className="topbar-right"><span className={`source-pill ${source.kind}`} title={source.description}><span className="status-dot"/>{source.title}</span><span className="project-avatar" title="Mara project">M</span></div></header>
    <div className="project-bar"><div><span className="eyebrow">PROJECT / 001</span><h1>The story stays yours.</h1><p>Generate freely. Keep every frame in canon.</p></div><button className="button primary generate-button" onClick={() => void generate()} disabled={busy || !data}><Icon name={generating ? "refresh" : "plus"} className={generating ? "spin" : ""}/>{generating ? "Generating batch…" : "Generate batch"}<kbd>6 shots</kbd></button></div>
    {error ? <div className="message-banner error-banner" role="alert"><Icon name="flag"/><span>{error}</span><button onClick={() => void retry()} disabled={busy || loading}>Retry project load</button><button className="icon-button" aria-label="Dismiss error" onClick={() => setError(null)}><Icon name="close"/></button></div> : null}
    {warnings.length ? <div className="message-banner warning-banner" role="status"><Icon name="flag"/><span>{[...new Set(warnings)].join(" ")}</span></div> : null}
    <div className="sr-only" role="status" aria-live="polite">{notice ?? (generating ? "Generating and checking six shots. This can take a few minutes." : "")}</div>
    <main className="studio-grid">
      <aside className="memory-pane panel" aria-labelledby="memory-title"><div className="pane-heading"><div className="heading-with-icon"><Icon name="frame"/><h2 id="memory-title">Canon Memory</h2></div><span className="count-badge">{data?.rules.length ?? "—"}</span></div>
        {loading && !data ? <MemorySkeleton/> : character ? <><div className="character-card"><div className="reference-image"><ShotImage src={character.referenceImageUrl} alt={`${character.name} character reference`} priority/><span className="reference-label">REFERENCE 01</span></div><div className="character-heading"><h3>{character.name}</h3><span className="tag">CHARACTER</span></div><p className="character-copy">The anchor for every generation.</p><dl className="attribute-list">{character.attributes.map((attribute) => <div key={attribute.key}><dt>{attribute.label}</dt><dd>{attribute.expected}</dd></div>)}</dl></div>
        <div className="memory-section-heading"><h3>Project rules</h3><span>{learned.length} learned</span></div><div className="rules-list">{data?.rules.length ? [...data.rules].sort((a,b) => Number(a.source === "seed") - Number(b.source === "seed")).map((rule) => <article className={`rule-card ${rule.source === "seed" ? "seed-rule" : "learned-rule"} ${newRuleId === rule.id ? "rule-arrived" : ""}`} key={rule.id}><Icon name={rule.source === "seed" ? "frame" : "spark"} size={14}/><div><p>{rule.text}</p><div className="rule-meta"><span>{rule.source === "seed" ? "Character canon" : "Learned from review"}</span><span title="Times this rule was applied">{rule.timesApplied}×</span></div></div></article>) : <div className="small-empty">Reject a shot with a correction to teach Canon a new rule.</div>}</div><div className="memory-footer"><Icon name="spark" size={14}/><p>Your corrections become constraints.<br/>{source.kind === "cached" ? "Recorded playback stays unchanged." : "The next batch remembers."}</p></div></> : <div className="small-empty">The character sheet will appear when the project is loaded.</div>}
      </aside>
      <section className="workbench-pane panel" id="workbench" aria-labelledby="shots-title"><div className="pane-heading"><div className="heading-with-icon"><Icon name="layers"/><h2 id="shots-title">Shot workspace</h2><span className="count-badge">{allShots.length}</span></div><div className="view-label"><span className="status-dot"/>{source.kind === "live" ? "LIVE MONITOR" : source.kind === "cached" ? "RECORDED CHECKS" : "CHECK RESULTS"}</div></div>
        <div className="workspace-controls"><div className="segmented" aria-label="Filter shots">{[{id:"all", label:"All shots", count:allShots.length}, {id:"flagged", label:"Flagged", count:flagged}, {id:"pending", label:"To review", count:pending}].map((tab) => <button key={tab.id} className={filter === tab.id ? "active" : ""} aria-pressed={filter === tab.id} onClick={() => setFilter(tab.id)}>{tab.label}<span>{tab.count}</span></button>)}</div><span className="filmstrip-hint">SCROLL TO EXPLORE <Icon name="arrow" size={13}/></span></div>
        <div className="batch-list">{loading && !data ? <BatchSkeleton/> : !batches.length && !generating ? <div className="workspace-empty"><span className="empty-icon"><Icon name="frame" size={30}/></span><h3>Your first sequence starts here.</h3><p>Generate six shots. Canon checks each frame against your character sheet and project rules.</p><button className="button secondary" disabled={!data} onClick={() => void generate()}><Icon name="plus"/>Generate first batch</button></div> : batches.map((batch) => {
          const shots = allShots.filter((shot) => shot.batchId === batch.id);
          const visibleShots = shots.filter((shot) => filter === "all" || filter === "flagged" && shot.flagged || filter === "pending" && shot.status === "pending");
          return <section className="batch-row" key={batch.id} aria-label={`Batch ${batch.index}`}><div className="batch-heading"><div className="batch-title"><span className="batch-index">{number(batch.index)}</span><h3>Batch {number(batch.index)}</h3><span className="batch-rule-count">{batch.rulesApplied.length} rules applied</span></div><span className={`batch-drift ${batch.driftRate > 0 ? "drift-text" : "pass-text"}`}><Icon name={batch.driftRate > 0 ? "flag" : "check"} size={12}/>{pct(batch.driftRate)} drift</span></div><div className="filmstrip" tabIndex={0} role="region" aria-label={`Batch ${batch.index} shots, horizontally scrollable`}>{visibleShots.length ? visibleShots.map((shot, index) => <ShotCard key={shot.id} shot={shot} index={shots.indexOf(shot)} selected={selectedId === shot.id} onSelect={() => selectShot(shot.id)} animate={newBatchId === batch.id} animationIndex={index}/>) : <div className="filter-empty">No {filter === "flagged" ? "flagged" : "pending"} shots in this batch.</div>}</div></section>;
        })}
        {generating ? <section className="batch-row generating-row" aria-label="Generating next batch"><div className="batch-heading"><div className="batch-title"><span className="batch-index"><Icon name="refresh" size={13} className="spin"/></span><h3>Building the next sequence</h3></div></div><p className="generation-message">{source.kind === "cached" ? "Loading saved generations and monitor checks…" : "Generating frames, applying memory, and checking continuity…"}</p><div className="filmstrip">{Array.from({ length: 6 }, (_, i) => <div className="shot-skeleton pulse" key={i} style={{ animationDelay: `${i * 35}ms` }}><span>{number(i+1)}</span><Icon name="frame" size={22}/></div>)}</div></section> : null}
        </div><div className="workspace-footer"><span><span className="status-dot"/>{source.description}</span>{notice ? <p>{notice}</p> : <p>Select a frame to inspect its continuity.</p>}</div>
      </section>
      <aside className="inspector-pane panel" aria-labelledby="inspector-title"><div className="pane-heading"><div className="heading-with-icon"><Icon name="image"/><h2 id="inspector-title">Shot inspector</h2></div><span className="eyebrow">{selected ? `${number(selectedBatch?.index ?? 1)} / ${number(allShots.filter((shot) => shot.batchId === selected.batchId).findIndex((shot) => shot.id === selected.id) + 1)}` : "—"}</span></div>
        {selected ? <><div className="inspector-preview"><ShotImage src={selected.imageUrl} alt={`Selected shot: ${selected.scenePrompt}`} priority/><span className={`preview-status ${selected.flagged ? "drift" : selectedUncertain ? "uncertain" : "pass"}`}><Icon name={selected.flagged || selectedUncertain ? "flag" : "check"} size={12}/>{selected.flagged ? "Continuity drift" : selectedUncertain ? "Evidence incomplete" : "In canon"}</span><span className="preview-corner"/></div><div className="inspector-content"><div className="shot-title-row"><h3>Frame {number(allShots.filter((shot) => shot.batchId === selected.batchId).findIndex((shot) => shot.id === selected.id)+1)}</h3><span className={`review-status ${selected.status}`}>{selected.status === "pending" ? "Awaiting review" : selected.status}</span></div><p className="scene-prompt">{selected.scenePrompt}</p><div className="checks-heading"><h4>Continuity checks</h4><span>{passedChecks(selected)}/{selected.checks.length} passed</span></div><div className="checks-list">{selected.checks.length ? selected.checks.map((check) => { const unclear = check.confidence < 0.6 || check.observed.toLowerCase() === "unclear"; return <div className={`check-row ${unclear ? "check-unclear" : check.pass ? "check-pass" : "check-fail"}`} key={check.key}><div className="check-heading"><span className={`check-icon ${unclear ? "uncertain" : check.pass ? "pass" : "drift"}`}><Icon name={check.pass ? "check" : "flag"} size={12}/></span><h5>{character?.attributes.find((a) => a.key === check.key)?.label ?? humanize(check.key)}</h5><span className={unclear ? "muted-text" : check.pass ? "pass-text" : "drift-text"}>{unclear ? "Unclear" : check.pass ? "Pass" : "Drift"}</span></div><div className="check-values"><span>Expected</span><p>{check.expected}</p><span>Observed</span><p className={unclear ? "muted-text" : check.pass ? "" : "drift-text"}>{check.observed}</p></div><div className="confidence-line"><div className="confidence-track"><span style={{ width: `${Math.min(100, Math.max(0, check.confidence * 100))}%` }}/></div><span>{pct(check.confidence)} confidence</span></div>{check.note ? <p className="check-note">{check.note}</p> : null}</div>; }) : <div className="small-empty">No monitor checks were returned for this shot.</div>}</div>
        <details className="prompt-details"><summary>Generation context <Icon name="chevron" size={12}/></summary><p className="detail-label">FINAL PROMPT</p><pre>{selected.finalPrompt}</pre>{provenanceText((selected as Shot & Metadata).provenance ?? data?.provenance) ? <><p className="detail-label">PROVENANCE</p><pre>{provenanceText((selected as Shot & Metadata).provenance ?? data?.provenance)}</pre></> : null}</details>
        </div><div className="review-panel">{selected.rejectReason && !rejectOpen ? <p className="saved-reason"><span>Review note</span>{selected.rejectReason}</p> : null}{rejectOpen ? <form onSubmit={(event) => { event.preventDefault(); void review("reject"); }}><label htmlFor="rejection-reason">What should Canon remember?</label><textarea id="rejection-reason" ref={reasonRef} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. The scarf must stay red, even in cool lighting." rows={3} maxLength={1000} disabled={reviewing}/><div className="reject-form-actions"><button type="button" className="button quiet" onClick={() => setRejectOpen(false)} disabled={reviewing}>Cancel</button><button className="button danger" type="submit" disabled={busy || !reason.trim()}><Icon name="spark" size={14}/>{reviewing ? "Saving…" : "Reject & teach"}</button></div></form> : <><div className="review-actions"><button className="button accept-button" disabled={busy || selected.status === "accepted"} onClick={() => void review("accept")}><Icon name="check"/>{selected.status === "accepted" ? "Accepted" : reviewing ? "Saving…" : "Accept"}<kbd>A</kbd></button><button className="button reject-button" disabled={busy} onClick={() => { setRejectOpen(true); requestAnimationFrame(() => reasonRef.current?.focus()); }}><Icon name="close"/>Reject<kbd>R</kbd></button></div><p className="review-help">Accept reinforces. Reject teaches.</p></>}</div></> : <div className="inspector-empty"><Icon name="frame" size={30}/><h3>A closer look.</h3><p>Select a frame to see its checks, review it, and teach Canon what matters.</p></div>}
      </aside>
      <div className="learning-pane panel"><LearningCurve batches={data?.batches ?? []}/></div>
    </main>
    <footer className="bottom-bar"><span className="bottom-brand"><Icon name="frame" size={13}/> MEMORY IN EVERY FRAME</span><button className={traceOpen ? "trace-toggle active" : "trace-toggle"} aria-expanded={traceOpen} aria-controls="trace-drawer" onClick={() => setTraceOpen(!traceOpen)}><Icon name="terminal" size={14}/>Trace log<span className="count-badge">{data?.traces.length ?? 0}</span><Icon name="chevron" size={12} className={traceOpen ? "rotate-down" : "rotate-up"}/></button><span className="session-info">{batches.length} {batches.length === 1 ? "batch" : "batches"}<span>·</span>{allShots.length} shots</span></footer>
    {traceOpen ? <section className="trace-drawer" id="trace-drawer" aria-labelledby="trace-title"><div className="trace-header"><div className="heading-with-icon"><Icon name="terminal"/><h2 id="trace-title">Monitor trace</h2><span className="count-badge">{data?.traces.length ?? 0}</span></div><div className="trace-header-actions"><label className="sr-only" htmlFor="trace-filter">Filter trace events</label><select id="trace-filter" value={traceFilter} onChange={(event) => setTraceFilter(event.target.value)}><option value="all">All events</option><option value="failures">Failures & drift</option><option value="memory">Memory</option></select><button className="icon-button" aria-label="Close trace log" onClick={() => setTraceOpen(false)}><Icon name="close"/></button></div></div><div className="trace-events">{filteredTraces.length ? filteredTraces.map((trace) => <div className={`trace-event trace-${trace.type}`} key={trace.id}><time dateTime={trace.createdAt}>{new Date(trace.createdAt).toLocaleTimeString("en-US", {hour12:false})}</time><span className="trace-type">{humanize(trace.type)}</span><p>{trace.message}{trace.category ? <span className="trace-category">{humanize(trace.category)}</span> : null}</p>{trace.shotId ? <button onClick={() => { selectShot(trace.shotId!); setTraceOpen(false); }}>View shot<Icon name="arrow" size={12}/></button> : null}</div>) : <div className="small-empty">No {traceFilter === "all" ? "trace" : traceFilter} events yet. Generation and review activity will appear here.</div>}</div></section> : null}
  </div>;
}

function ShotCard({ shot, index, selected, onSelect, animate, animationIndex }: { shot: Shot; index: number; selected: boolean; onSelect: () => void; animate: boolean; animationIndex: number }) {
  const failure = shot.checks.find((check) => !check.pass && check.confidence >= 0.6);
  const isUncertain = uncertain(shot);
  return <button className={`shot-card ${selected ? "selected" : ""} ${shot.flagged ? "flagged" : ""} ${animate ? "shot-arrived" : ""}`} style={{ animationDelay: `${animationIndex * 25}ms` }} onClick={onSelect} aria-pressed={selected} aria-label={`Frame ${index + 1}. ${shot.flagged ? "Continuity drift" : isUncertain ? "Evidence incomplete" : "In canon"}. ${shot.status}. ${shot.scenePrompt}`}><div className="shot-thumbnail"><ShotImage src={shot.imageUrl} alt={shot.scenePrompt}/><span className="shot-number">{number(index + 1)}</span><span className={`shot-signal ${shot.flagged ? "drift" : isUncertain ? "uncertain" : "pass"}`} title={shot.flagged ? "Continuity drift" : isUncertain ? "Evidence incomplete" : "In canon"}><Icon name={shot.flagged || isUncertain ? "flag" : "check"} size={12}/></span>{shot.status !== "pending" ? <span className={`thumbnail-review ${shot.status}`}><Icon name={shot.status === "accepted" ? "check" : "close"} size={11}/>{shot.status}</span> : null}</div><div className="shot-card-body"><div><span className="shot-frame-title">Frame {number(index + 1)}</span><span className={`shot-check-count ${shot.flagged ? "drift-text" : isUncertain ? "muted-text" : "pass-text"}`}>{passedChecks(shot)}/{shot.checks.length}</span></div><p>{shot.scenePrompt}</p><span className={`shot-footnote ${shot.flagged ? "drift-text" : "muted-text"}`}><Icon name={shot.flagged || isUncertain ? "flag" : "check"} size={11}/>{failure ? `${humanize(failure.key)} drift` : isUncertain ? "Evidence incomplete" : "Continuity verified"}</span></div></button>;
}
function MemorySkeleton() { return <div className="memory-skeleton" aria-label="Loading character memory"><div className="skeleton-reference pulse"/>{Array.from({length:4}, (_,i) => <div key={i} className="skeleton-line pulse"/>)}</div>; }
function BatchSkeleton() { return <div className="initial-loading" role="status"><p>Opening the continuity workspace…</p><div className="filmstrip">{Array.from({length:6}, (_,i) => <div key={i} className="shot-skeleton pulse"><Icon name="frame" size={22}/></div>)}</div></div>; }
