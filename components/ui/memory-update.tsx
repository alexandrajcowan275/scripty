"use client";
import { useEffect, useRef, useState } from "react";
import type { Shot } from "@/lib/types";
import { LearnedRuleCard } from "./rule-card";
import { AccessDialog, ErrorNotice } from "./chrome";
import {
  nextTakeIndex,
  generatedBatchId,
  frameName,
  currentShot,
  operationIssue,
  money,
  message,
  type ProductionData,
  type ReviewReceipt,
} from "../ui-v2/data";
import { useProduction } from "../ui-v2/provider";
import { useMotionNavigation } from "./motion";
import { useConfiguration } from "../ui-v2/config";

export function MemoryUpdate({
  open,
  receipt,
  shot,
  data,
  merged,
  onClose,
  onNext,
  onSave,
}: {
  open: boolean;
  receipt: ReviewReceipt;
  shot: Shot;
  data: ProductionData;
  merged: boolean;
  onClose: () => void;
  onNext: () => void;
  onSave: () => void;
}) {
  const navigate = useMotionNavigation();
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    { run, busy } = useProduction(),
    { config, refreshConfig } = useConfiguration();
  const [recheck, setRecheck] = useState(false),
    [fix, setFix] = useState(false),
    [error, setError] = useState(""),
    [access, setAccess] = useState(false);
  const rule = receipt.newRule!;
  const isSample = data.mode === "cached";
  useEffect(() => {
    if (open && !dialog.current?.open) {
      dialog.current?.showModal();
      heading.current?.focus({ preventScroll: true });
    }
    if (!open) dialog.current?.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    setRecheck(false);
    setFix(false);
    setError("");
  }, [open]);
  async function save() {
    if ((recheck || fix) && !config?.authorized) {
      setAccess(true);
      return;
    }
    setError("");
    try {
      let targets = data.shots
        .filter((s) => currentShot(s, data).flagged)
        .map((s) => s.id);
      if (recheck) {
        const result = (await run("recheck", { ruleIds: [rule.id] })) as {
          results?: { shotId?: string; flagged?: boolean }[];
          failed?: number;
        };
        if (result.failed)
          throw new Error(
            `${result.failed} checks could not finish. Your rule is saved; try again.`,
          );
        if (result.results)
          targets = result.results
            .filter((r) => r.flagged && r.shotId)
            .map((r) => r.shotId!);
      }
      if (fix && targets.length) {
        const fixed = await run("fix", { shotIds: targets });
        if (operationIssue(fixed)) throw new Error(operationIssue(fixed));
      }
      onSave();
    } catch (e) {
      setError(message(e));
    }
  }
  const next = data.shots.some(
      (s) =>
        currentShot(s, data).flagged &&
        s.status === "pending" &&
        s.id !== shot.id,
    ),
    flagged = data.shots.filter((s) => currentShot(s, data).flagged).length;
  return (
    <>
      <dialog
        ref={dialog}
        className="v2-memory-sheet v2-glass"
        aria-labelledby="memory-update-title"
        onCancel={onClose}
        onClose={onClose}
      >
        <div className="v2-memory-sheet-heading">
          <h2
            ref={heading}
            tabIndex={-1}
            id="memory-update-title"
            className="v2-label"
          >
            Rule learned
          </h2>
          <button
            className="v2-close"
            onClick={onClose}
            aria-label="Close memory update"
          >
            ×
          </button>
        </div>
        <div
          className="v2-memory-sheet-body"
          role="region"
          aria-label="Rule details"
          tabIndex={0}
        >
          <LearnedRuleCard rule={rule} shot={shot} merged={merged} />
          <p className="v2-learned-source">
            From your note on {frameName(shot, data)}.{" "}
            {merged ? "Merged with canon." : "Saved to memory."}
          </p>
          {isSample && (
            <p className="v2-muted">
              Creator note saved in this browser. Original takes stay unchanged.
            </p>
          )}
          {receipt.warning &&
            /unavailable|failed|could not|error|retry/i.test(
              receipt.warning,
            ) && <ErrorNotice>{receipt.warning}</ErrorNotice>}
          <details className="v2-rule-options">
            <summary>Rule options</summary>
            <fieldset className="v2-rule-reach">
              <legend className="v2-label">Apply this rule to</legend>
              <label className="v2-reach-option on">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  aria-label={
                    isSample
                      ? "Browser sample memory: saved"
                      : "Every future take: saved"
                  }
                />
                <span>
                  <strong>
                    {isSample ? "Your sample memory" : "Every future take"}
                  </strong>
                  <span>
                    {isSample
                      ? "Saved in this browser. Recorded takes stay unchanged."
                      : "Saved for future prompts and checks. Nothing regenerates now."}
                  </span>
                </span>
                <span className="v2-mono">saved</span>
              </label>
              <label className={`v2-reach-option ${recheck ? "on" : ""}`}>
                <input
                  type="checkbox"
                  checked={recheck}
                  onChange={(e) => setRecheck(e.target.checked)}
                />
                <span>
                  <strong>
                    Re-check the {data.shots.length}{" "}
                    {data.shots.length === 1 ? "shot" : "shots"} you already
                    have
                  </strong>
                  <span>Checks your existing images. No new generation.</span>
                </span>
                <span className="v2-mono">—</span>
              </label>
              <label className={`v2-reach-option ${fix ? "on" : ""}`}>
                <input
                  type="checkbox"
                  checked={fix}
                  disabled={!flagged}
                  onChange={(e) => setFix(e.target.checked)}
                />
                <span>
                  <strong>Fix shots that break it</strong>
                  <span>
                    Generates only flagged shots. Keeps the originals.
                  </span>
                </span>
                <span className="v2-mono">
                  {flagged} {flagged === 1 ? "shot" : "shots"} ·{" "}
                  {money(
                    config?.observedImageCostUsd == null
                      ? null
                      : config.observedImageCostUsd * flagged,
                  )}
                </span>
              </label>
            </fieldset>
          </details>
          <div className="v2-memory-diffs">
            <div>
              <span>// next prompt · preview</span>
              <pre>
                ACTIVE CANON CONSTRAINTS:{"\n"}
                {data.rules
                  .filter((r) => r.id !== rule.id)
                  .map((r) => `- ${r.text}`)
                  .join("\n")}
                {"\n"}
                <mark>+ {rule.text}</mark>
              </pre>
            </div>
            <div>
              <span>// next check · preview</span>
              <pre>
                {JSON.stringify(
                  { key: `rule:${rule.id}`, expected: rule.text },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
          {error && <ErrorNotice>{error}</ErrorNotice>}
        </div>
        <footer>
          <span>
            Memory:{" "}
            <strong>
              {data.rules.length} {data.rules.length === 1 ? "rule" : "rules"}
            </strong>{" "}
            · {data.rules.filter((r) => r.source !== "seed").length} learned
          </span>
          <div>
            {!isSample && (
              <button
                className="v2-button"
                disabled={!!busy}
                onClick={async () => {
                  if (!config?.authorized) {
                    setAccess(true);
                    return;
                  }
                  setError("");
                  try {
                    const result = await run("generate");
                    if (operationIssue(result))
                      throw new Error(operationIssue(result));
                    const batchId = generatedBatchId("generate", result);
                    if (batchId)
                      navigate(
                        `/p/${data.project.id}?take=${encodeURIComponent(batchId)}`,
                        "memory",
                      );
                    else onSave();
                  } catch (e) {
                    setError(message(e));
                  }
                }}
              >
                Generate take {nextTakeIndex(data)} with this rule
              </button>
            )}
            <button
              className="v2-button v2-light"
              disabled={!next || !!busy}
              onClick={onNext}
            >
              Next flagged shot
            </button>
            <button
              className="v2-button v2-light"
              disabled={!!busy}
              onClick={() => void save()}
            >
              {busy
                ? "Applying…"
                : recheck || fix
                  ? "Apply options"
                  : "Back to Studio"}
            </button>
          </div>
        </footer>
      </dialog>
      <AccessDialog
        open={access}
        onClose={() => setAccess(false)}
        onGranted={() => {
          void refreshConfig();
        }}
      />
    </>
  );
}
