"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShotImage } from "../shot-image";
import { ErrorNotice, Kbd, Nav } from "../ui/chrome";
import { Ambient, MotionLink } from "../ui/motion";
import { ConfusionMatrix } from "../ui/metrics";
import { frameName, message, post, request } from "./data";
import {
  pendingQuestions,
  questionKey,
  type Evaluation,
  type LabelData,
} from "./evaluation";
import { useProduction } from "./provider";
export function EvalScreen() {
  const { id, data, error: productionError } = useProduction();
  const [labels, setLabels] = useState<LabelData | null>(null),
    [evaluation, setEvaluation] = useState<Evaluation | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [direction, setDirection] = useState(""),
    [updated, setUpdated] = useState(false);
  const pending = useRef(false),
    active = useRef(true),
    keyAction = useRef<(pass: boolean | null) => void>(() => {});
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await request<LabelData>(
        `/api/project/${encodeURIComponent(id)}/labels`,
      );
      if (active.current) setLabels(result);
      const stats = await post<Evaluation>("/api/eval", { projectId: id });
      if (active.current) setEvaluation(stats);
    } catch (e) {
      if (active.current) setError(message(e));
    } finally {
      if (active.current) setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    active.current = true;
    if (data) void load();
    return () => {
      active.current = false;
    };
  }, [load, !!data]);
  const queue = labels ? pendingQuestions(labels) : [],
    question = queue[0],
    current = data?.shots.find((s) => s.id === question?.shotId);
  async function answer(pass: boolean | null) {
    if (!question || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await post<{ saved: boolean; created_at: string }>(
        `/api/project/${encodeURIComponent(id)}/labels`,
        { shotId: question.shotId, attributeKey: question.attributeKey, pass },
      );
      if (!saved.saved)
        throw new Error("That judgment hasn’t saved. Try again.");
      setDirection(pass === null ? "unsure" : pass ? "yes" : "no");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 150
            : 260,
        ),
      );
      if (!active.current) return;
      setLabels((previous) =>
        previous
          ? {
              ...previous,
              labels: [
                ...previous.labels.filter(
                  (label) => questionKey(label) !== questionKey(question),
                ),
                {
                  shotId: question.shotId,
                  attributeKey: question.attributeKey,
                  pass,
                  createdAt: saved.created_at,
                },
              ],
            }
          : previous,
      );
      setDirection("");
      const stats = await post<Evaluation>("/api/eval", { projectId: id });
      if (active.current) {
        setEvaluation(stats);
        setUpdated(true);
      }
    } catch (e) {
      if (active.current) {
        setError(message(e));
        setDirection("");
      }
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }
  keyAction.current = (pass) => {
    void answer(pass);
  };
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.defaultPrevented ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        document.querySelector("dialog[open]") ||
        /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)
      )
        return;
      const key = e.key.toLowerCase();
      if (["y", "n", "u"].includes(key)) {
        e.preventDefault();
        keyAction.current(key === "u" ? null : key === "y");
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const upcoming = queue
    .filter((q) => q.shotId !== question?.shotId)
    .filter(
      (q, i, list) => list.findIndex((item) => item.shotId === q.shotId) === i,
    )
    .slice(0, 2);
  return (
    <div className="v2-screen v2-eval">
      <Ambient />
      <Nav id={id} data={data} active="eval" />
      <div className="v2-eval-layout">
        <main className="v2-eval-main">
          {(error || productionError) && (
            <ErrorNotice retry={() => void load()}>
              {error || productionError}
            </ErrorNotice>
          )}
          {loading ? (
            <div
              className="v2-skeleton v2-eval-skeleton"
              aria-label="Loading blind question"
            />
          ) : question ? (
            <>
              <div>
                <span className="v2-label">
                  Question {new Set(labels?.labels.map(questionKey)).size + 1}{" "}
                  of {labels?.questions.length ?? "—"} · monitor verdict hidden
                </span>
                <h1>
                  Does this shot show
                  <br />
                  <span>{question.expected}?</span>
                </h1>
              </div>
              <div className="v2-eval-stack">
                {upcoming.reverse().map((item, index) => (
                  <div
                    key={questionKey(item)}
                    className={`v2-eval-card behind behind-${index}`}
                    aria-hidden="true"
                  >
                    <ShotImage src={item.imageUrl} alt="" />
                  </div>
                ))}
                <div
                  className={`v2-eval-card current ${direction ? `swipe-${direction}` : ""}`}
                  key={questionKey(question)}
                >
                  <ShotImage
                    src={question.imageUrl}
                    alt="Shot for your independent continuity judgment"
                    priority
                  />
                  <span className="v2-frame-tag v2-glass v2-mono">
                    {current && data ? frameName(current, data) : "—"}
                  </span>
                </div>
              </div>
              <div className="v2-answer-row">
                <button
                  className="v2-answer yes"
                  disabled={busy}
                  onClick={() => void answer(true)}
                >
                  Yes <Kbd>Y</Kbd>
                </button>
                <button
                  className="v2-answer no"
                  disabled={busy}
                  onClick={() => void answer(false)}
                >
                  No <Kbd>N</Kbd>
                </button>
                <button
                  className="v2-answer"
                  disabled={busy}
                  onClick={() => void answer(null)}
                >
                  Can’t tell <Kbd>U</Kbd>
                </button>
              </div>
              <details className="v2-eval-reference">
                <summary>Check the character reference</summary>
                <ShotImage
                  src={question.referenceImageUrl}
                  alt="Character reference for this question"
                />
              </details>
            </>
          ) : labels ? (
            <section className="v2-empty-production">
              <h1>That’s a wrap.</h1>
              <p>Your judgments are saved for this production.</p>
              <MotionLink
                href={`/p/${id}/evidence`}
                kind="evidence"
                className="v2-button"
              >
                See the evidence →
              </MotionLink>
            </section>
          ) : (
            <p className="v2-muted">The questions haven’t returned yet.</p>
          )}
        </main>
        <aside className="v2-eval-aside">
          <ConfusionMatrix
            evaluation={evaluation}
            answered={
              labels ? new Set(labels.labels.map(questionKey)).size : null
            }
            total={labels?.questions.length ?? null}
            updating={updated}
          />
          <p className="v2-calibration-note">
            Your disagreements teach this production’s checker what it missed.
          </p>
        </aside>
      </div>
    </div>
  );
}
