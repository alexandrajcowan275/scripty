"use client";
import { AppPageHeader } from "../ui/app-shell";

import { useEffect, useRef, useState } from "react";
import type { Shot } from "@/lib/types";
import { ScreenSkeleton } from "../ui/skeleton";
import { InspectImage, CheckList } from "../ui/inspection";
import { SharedShotImage } from "../ui/shot-card";
import { MemoryUpdate } from "../ui/memory-update";
import { ShotImage } from "../shot-image";
import { AccessDialog, ErrorNotice, Kbd } from "../ui/chrome";
import { Ambient, MotionLink, useMotionNavigation } from "../ui/motion";
import {
  allShots,
  checkLabel,
  currentShot,
  failedCheck,
  frameName,
  message,
  operationIssue,
  money,
  reviewReason,
  shotsFor,
  sortedBatches,
  unclear,
} from "./data";
import { useProduction } from "./provider";
import { useConfiguration } from "./config";

type Mode = "shot" | "reference" | "comparison";
export function ReviewScreen({ shotId }: { shotId: string }) {
  const {
    id,
    data,
    loading,
    error,
    busy,
    refresh,
    review,
    run,
    receipt,
    notes,
    setNote,
  } = useProduction();
  const { config, refreshConfig } = useConfiguration(),
    navigate = useMotionNavigation();
  const [mode, setMode] = useState<Mode>("shot"),
    [localError, setLocalError] = useState(""),
    [memoryOpen, setMemoryOpen] = useState(false),
    [access, setAccess] = useState(false),
    [merged, setMerged] = useState(false);
  const original = data
      ? allShots(data).find((s) => s.id === shotId)
      : undefined,
    shot = original && data ? currentShot(original, data) : undefined;
  const sourceId = data?.repairs?.find(
      (r) => r.shot_id === shotId,
    )?.source_shot_id,
    sourceShot = data?.shots.find((s) => s.id === sourceId);
  const batch = data?.batches.find(
      (b) => b.id === (sourceShot ?? shot)?.batchId,
    ),
    strip = shotsFor(data, batch?.id),
    index = strip.findIndex((s) => s.id === (sourceId ?? shotId)),
    note = notes[shotId] ?? (shot ? reviewReason(shot) : "");
  const actions = useRef({
    accept: async () => {},
    reject: async () => {},
    move: (_delta: number) => {},
    back: () => {},
  });
  const originalRuleIds = useRef(new Set<string>());
  const goBack = () =>
    navigate(`/p/${id}${batch ? `?take=${batch.id}` : ""}`, "shot");
  const move = (delta: number) => {
    const next = strip[index + delta];
    if (next) {
      setMemoryOpen(false);
      navigate(`/p/${id}/shot/${next.id}`, "shot-step");
    }
  };
  async function decide(decision: "accept" | "reject") {
    if (!shot || busy || (decision === "reject" && !note.trim())) return;
    setLocalError("");
    originalRuleIds.current = new Set(data?.rules.map((r) => r.id));
    try {
      const result = await review(
        shot.id,
        decision,
        decision === "reject" ? note : undefined,
      );
      if (decision === "reject" && result.newRule) {
        setMerged(
          result.merged ?? originalRuleIds.current.has(result.newRule.id),
        );
        setMemoryOpen(true);
      } else if (decision === "reject")
        setLocalError(
          "The review saved, but no rule returned. Reopen Memory to inspect it.",
        );
      else {
        const next = strip.slice(index + 1).find((s) => s.status === "pending");
        if (next) navigate(`/p/${id}/shot/${next.id}`, "shot");
        else goBack();
      }
    } catch (e) {
      setLocalError(message(e));
    }
  }
  actions.current = {
    accept: () => decide("accept"),
    reject: () => decide("reject"),
    move,
    back: goBack,
  };
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.repeat ||
        document.querySelector("dialog[open]")
      )
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        actions.current.back();
        return;
      }
      if (
        /INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName) ||
        (event.target as HTMLElement).isContentEditable
      )
        return;
      const key = event.key.toLowerCase();
      if (key === "r") {
        event.preventDefault();
        void actions.current.reject();
      } else if (key === "a") {
        event.preventDefault();
        void actions.current.accept();
      } else if (key === "j") {
        event.preventDefault();
        actions.current.move(-1);
      } else if (key === "k") {
        event.preventDefault();
        actions.current.move(1);
      } else if (key === "escape") {
        event.preventDefault();
        actions.current.back();
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);
  useEffect(() => {
    setMemoryOpen(false);
    setLocalError("");
    setMode("shot");
  }, [shotId]);
  useEffect(() => {
    document.title = `${data?.project.name ?? "Scripty"} — Review`;
  }, [data?.project.name]);
  async function fix() {
    if (!shot) return;
    if (!config?.authorized) {
      setAccess(true);
      return;
    }
    try {
      setLocalError("");
      const result = (await run("fix", { shotIds: [shot.id] })) as {
        repaired?: { shot?: Shot }[];
      };
      const repaired = result.repaired?.find((r) => r.shot)?.shot;
      if (operationIssue(result)) {
        setLocalError(operationIssue(result));
        return;
      }
      if (repaired) navigate(`/p/${id}/shot/${repaired.id}`, "shot");
    } catch (e) {
      setLocalError(message(e));
    }
  }
  const before =
      data && batch
        ? sortedBatches(data)
            .filter((b) => b.index < batch.index)
            .at(-1)
        : undefined,
    previousShot =
      sourceShot ??
      (data && before
        ? shotsFor(data, before.id)[Math.max(0, index)]
        : undefined);
  return (
    <div className="v2-screen v2-workspace v2-review">
      <Ambient />
      <AppPageHeader
        title="Review"
        id={id}
        productionName={data?.project.name}
      />
      <header className="v2-review-top">
        <div className="v2-review-top-left">
          <button className="v2-button v2-light v2-small" onClick={goBack}>
            ← Studio <Kbd>Esc</Kbd>
          </button>
          <span>
            {data?.project.name ?? "—"} · Take {batch?.index ?? "—"} ·{" "}
            <strong>
              Shot {index < 0 ? "—" : index + 1} of {strip.length || "—"}
            </strong>
          </span>
          <div className="v2-shot-steppers">
            <button
              onClick={() => move(-1)}
              disabled={index <= 0}
              aria-label="Previous shot (J)"
            >
              ‹
            </button>
            <span className="v2-mono">J · K</span>
            <button
              onClick={() => move(1)}
              disabled={index < 0 || index >= strip.length - 1}
              aria-label="Next shot (K)"
            >
              ›
            </button>
          </div>
        </div>
        <div className="v2-segment" role="group" aria-label="Comparison view">
          <button
            className={mode === "shot" ? "on" : ""}
            aria-pressed={mode === "shot"}
            onClick={() => setMode("shot")}
          >
            Shot
          </button>
          <button
            className={mode === "reference" ? "on" : ""}
            aria-pressed={mode === "reference"}
            onClick={() => setMode("reference")}
          >
            With reference
          </button>
          <button
            className={mode === "comparison" ? "on" : ""}
            aria-pressed={mode === "comparison"}
            disabled={!previousShot}
            onClick={() => setMode("comparison")}
          >
            {sourceShot
              ? "Original vs fix"
              : before && batch
                ? `Take ${before.index} vs ${batch.index}`
                : "Compare takes"}
          </button>
        </div>
      </header>
      {(error || localError) && (
        <div className="v2-review-error">
          <ErrorNotice
            retry={() => {
              void refresh().catch((e) => setLocalError(message(e)));
            }}
          >
            {localError || error}
          </ErrorNotice>
        </div>
      )}
      {loading ? (
        <ScreenSkeleton review />
      ) : !shot || !data ? (
        <main className="v2-loading-page">
          <h2>This shot isn’t on the contact sheet.</h2>
          <button className="v2-button" onClick={goBack}>
            Back to Studio
          </button>
        </main>
      ) : (
        <div className="v2-review-grid">
          <main className="v2-review-main">
            {mode === "shot" ? (
              <InspectImage
                shot={shot}
                data={data}
                scanning={busy === "fix" || busy === "recheck"}
              />
            ) : (
              <div className="v2-comparison-stage" key={mode}>
                <figure>
                  <ShotImage
                    src={
                      mode === "reference"
                        ? (data.project.characters[0]?.referenceImageUrl ?? "")
                        : (previousShot?.imageUrl ?? "")
                    }
                    alt={
                      mode === "reference"
                        ? "Current character reference"
                        : (previousShot?.scenePrompt ?? "Previous take")
                    }
                    priority
                  />
                  <figcaption>
                    {mode === "reference"
                      ? "Character reference"
                      : sourceShot
                        ? "Original shot"
                        : `Take ${before?.index ?? "—"} · different scene`}
                  </figcaption>
                </figure>
                <figure>
                  <SharedShotImage shot={shot} priority />
                  <figcaption>
                    {frameName(shot, data)} · selected shot
                  </figcaption>
                </figure>
              </div>
            )}
            <nav className="v2-filmstrip" aria-label="Shots in this take">
              {strip.map((item) => (
                <MotionLink
                  key={item.id}
                  href={`/p/${id}/shot/${item.id}`}
                  kind="shot-step"
                  className={item.id === (sourceId ?? shotId) ? "on" : ""}
                  title={item.scenePrompt}
                >
                  <ShotImage
                    src={item.imageUrl}
                    alt={frameName(item, data)}
                    variant="thumbnail"
                  />
                </MotionLink>
              ))}
            </nav>
          </main>
          <aside className="v2-inspector">
            <div>
              <span
                className={`v2-label ${shot.flagged ? "v2-drift-text" : ""}`}
              >
                {shot.flagged ? "Flagged · continuity" : "Continuity check"}
                {data.monitorRuns?.some((r) => r.shot_id === shot.id)
                  ? " · rechecked"
                  : ""}
              </span>
              <h2>
                {shot.flagged
                  ? `${failedCheck(shot) ? checkLabel(failedCheck(shot)!.key, data) : "This shot"} needs a second look.`
                  : !shot.checks.length
                    ? "Checks haven’t returned yet."
                    : shot.checks.some(unclear)
                      ? "A detail is still unclear."
                      : "The character holds."}
              </h2>
            </div>
            <CheckList shot={shot} data={data} />
            <div className="v2-review-note">
              <label htmlFor="continuity-note" className="v2-label">
                Your note
              </label>
              <textarea
                id="continuity-note"
                rows={3}
                maxLength={400}
                value={note}
                onChange={(e) => setNote(shotId, e.target.value)}
              />
              <div className="v2-note-chips">
                {["Wrong side", "Missing", "Monitor is wrong"].map((label) => (
                  <button
                    key={label}
                    onClick={() =>
                      setNote(shotId, `${label}. ${note}`.slice(0, 400))
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="v2-review-actions">
              <button
                className="v2-button"
                disabled={!!busy || !note.trim()}
                onClick={() => void decide("reject")}
              >
                {busy === "review" ? "Remembering…" : "Reject & remember"}{" "}
                <Kbd>R</Kbd>
              </button>
              <div>
                <button
                  className="v2-button v2-light"
                  disabled={!!busy}
                  onClick={() => void decide("accept")}
                >
                  Looks right <Kbd>A</Kbd>
                </button>
                <button
                  className="v2-button v2-light"
                  disabled={!!busy || !shot.flagged}
                  onClick={() => void fix()}
                >
                  Fix this shot
                </button>
              </div>
              <p className="v2-mono">
                Fixes only this shot · est.{" "}
                {money(config?.observedImageCostUsd)}
              </p>
            </div>
          </aside>
        </div>
      )}
      {data && shot && receipt?.newRule && (
        <MemoryUpdate
          open={memoryOpen}
          receipt={receipt}
          shot={shot}
          data={data}
          merged={merged}
          onClose={() => setMemoryOpen(false)}
          onNext={() => {
            const next = data.shots.find(
              (s) =>
                currentShot(s, data).flagged &&
                s.status === "pending" &&
                s.id !== shot.id,
            );
            if (next) {
              setMemoryOpen(false);
              navigate(`/p/${id}/shot/${next.id}`, "shot");
            }
          }}
          onSave={() =>
            navigate(`/p/${id}${batch ? `?take=${batch.id}` : ""}`, "memory")
          }
        />
      )}
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
