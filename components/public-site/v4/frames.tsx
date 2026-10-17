"use client";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ShotImage } from "@/components/shot-image";
import { V4Site } from "./shell";
import type { EvidenceFrame } from "./data";
type Props = {
  frames: EvidenceFrame[];
  rule: string;
  ruleKey: string;
  reach: number;
  ab: number[];
};
export function FrameInspector({ frames, rule, ruleKey, reach, ab }: Props) {
  const [selected, setSelected] = useState(frames[1]);
  const [lit, setLit] = useState(0);
  const [path, setPath] = useState("");
  const [run, setRun] = useState(0);
  const table = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const later = frames.filter(
    (frame) =>
      frame.take > 1 &&
      frame.finalPrompt.includes(rule) &&
      frame.checks.some((check) => check.key === ruleKey),
  );
  function follow() {
    cancelAnimationFrame(raf.current);
    const host = table.current;
    if (!host) return;
    const r = host.getBoundingClientRect();
    const points = [frames[1], ...later].map((frame) => {
      const el = host.querySelector<HTMLElement>(`[data-id="${frame.id}"]`)!;
      const b = el.getBoundingClientRect();
      return [b.right - r.left - 10, b.top - r.top + 10];
    });
    setPath(
      points
        .map(([x, y], i) => {
          if (!i) return `M${x} ${y}`;
          const [x0, y0] = points[i - 1];
          return y === y0
            ? ` L ${x} ${y}`
            : ` C ${x0} ${(y0 + y) / 2}, ${x} ${(y0 + y) / 2}, ${x} ${y}`;
        })
        .join(""),
    );
    setRun((n) => n + 1);
    setLit(0);
    const start = performance.now();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function tick(now: number) {
      const p = reduce ? 1 : Math.min(1, (now - start) / 2600);
      setLit(Math.floor(p * later.length));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
  }
  const cons =
    selected.finalPrompt
      .match(/ACTIVE (?:STORY|CANON) CONSTRAINTS[^\n]*:\n(?:- [^\n]*\n?)+/)?.[0]
      .trim() ?? selected.finalPrompt;
  function checkState(check: EvidenceFrame["checks"][number]) {
    return !check.pass
      ? selected.flagged && check.confidence >= 0.6
        ? "drift"
        : "uncertain"
      : check.confidence < 0.6 ||
          /unclear|not visible|occluded|cannot determine/i.test(check.observed)
        ? "uncertain"
        : "pass";
  }
  return (
    <V4Site active="Evidence">
      <div className="v4-frames">
        <div className="wrap">
          <Link className="back" href="/evidence">
            ← Back to the story
          </Link>
          <div className="intro">
            <div>
              <div className="eb">
                Evidence · Mara · {frames.length} original frames, 4 takes
              </div>
              <h1>
                One note in Take 1.
                <br />
                <span>Followed through every take after it.</span>
              </h1>
            </div>
            <p className="lede">
              Every frame below is an original, ungraded generation. Pick any
              frame to see its prompt and checks. Follow the creator&apos;s note
              to see where it went.
            </p>
          </div>
          <div className="stage">
            <div>
              <div className="table" ref={table}>
                <svg className="thread" aria-hidden="true">
                  {path && <path key={run} d={path} pathLength="1" />}
                </svg>
                <div className="legend">
                  <span>
                    <i className="flag-icon" />
                    flagged by monitor
                  </span>
                  <span>
                    <i className="rule-icon" />
                    rule in prompt + check
                  </span>
                  <span>
                    <i className="uncertain-icon" />
                    uncertain check
                  </span>
                </div>
                {[1, 2, 3, 4].map((take) => (
                  <div className="tk" key={take}>
                    <div className="tl">
                      <b>Take {take}</b>
                      <span
                        className={
                          frames.some((f) => f.take === take && f.flagged)
                            ? "fl"
                            : ""
                        }
                      >
                        {
                          frames.filter((f) => f.take === take && f.flagged)
                            .length
                        }
                        /6 FLAGGED
                      </span>
                      <span>
                        {take === 1 ? "CANON ONLY" : "CANON + LEARNED RULE"}
                      </span>
                    </div>
                    <div className="frames">
                      {frames
                        .filter((f) => f.take === take)
                        .map((frame) => (
                          <button
                            key={frame.id}
                            data-id={frame.id}
                            className={`fr ${frame.flagged ? "flag" : ""} ${selected.id === frame.id ? "sel" : ""} ${later.findIndex((f) => f.id === frame.id) >= 0 && later.findIndex((f) => f.id === frame.id) < lit ? "lit" : ""}`}
                            aria-label={`Inspect Take ${take}, Shot ${frame.number}`}
                            aria-pressed={selected.id === frame.id}
                            onClick={() => setSelected(frame)}
                          >
                            <ShotImage
                              src={frame.imageUrl}
                              alt={frame.scenePrompt}
                              variant="thumbnail"
                            />
                            <span className="n">
                              T{take}·S0{frame.number}
                            </span>
                            <i className="tick" />
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="note">
                <div className="who">
                  CREATOR NOTE · TAKE 1 · SHOT 2 · REJECTED
                </div>
                “{frames[1].rejectReason}”
                <div className="learned-copy">→ saved as rule: “{rule}”</div>
                <button onClick={follow}>Follow this note →</button>
              </div>
              <div className="counter" aria-live="polite">
                <span>
                  <b>{lit}</b>later prompts carried it
                </span>
                <span>
                  <b>{lit}</b>later checks included it
                </span>
              </div>
            </div>
            <aside className="slate" aria-label="Selected frame">
              <ShotImage
                src={selected.imageUrl}
                alt={selected.scenePrompt}
                priority
              />
              <div className="sb">
                <div className="sh">
                  <span>
                    TAKE {selected.take} · SHOT {selected.number}
                  </span>
                  <span className={selected.flagged ? "flag-label" : ""}>
                    {selected.flagged ? "FLAGGED" : "NOT FLAGGED"}
                    {selected.status === "rejected" ? " · REJECTED" : ""}
                  </span>
                </div>
                <div className="scene">{selected.scenePrompt}</div>
                {selected.rejectReason && (
                  <div className="reason">
                    <div className="eb">CREATOR NOTE</div>
                    {selected.rejectReason}
                  </div>
                )}
                <div>
                  <div className="eb prompt-label">Prompt excerpt</div>
                  <div className="prompt">
                    {cons.split("\n").map((line, i) => (
                      <span key={i}>
                        {line.includes(rule) ? <mark>{line}</mark> : line}
                        {i < cons.split("\n").length - 1 ? "\n" : ""}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="eb">Checks</div>
                  {selected.checks.map((check, i) => {
                    const state = checkState(check);
                    return (
                      <div className="ck" key={`${check.key}-${i}`}>
                        <span>
                          {check.key
                            .replace("rule:seed-", "rule · ")
                            .replace(ruleKey, "rule · ring")
                            .replaceAll("_", " ")}
                        </span>
                        <span className={`st ${state}`}>
                          {state === "pass"
                            ? "✓"
                            : state === "drift"
                              ? "✕"
                              : "?"}{" "}
                          {state} · {check.confidence.toFixed(2)}
                        </span>
                        {state !== "pass" && <small>{check.observed}</small>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
          <div className="method">
            <div>
              <h4>What this shows</h4>
              <p>
                A creator&apos;s correction became a saved rule, and that rule
                was carried into all {reach} later prompts and all {reach} later
                checks.
              </p>
            </div>
            <div>
              <h4>What it doesn&apos;t show</h4>
              <p>
                Each take used new scenes, so this is not a before/after. A
                matched A/B test found {ab[0]}/6 targeted flags in both arms: no
                extra visual improvement shown yet.
              </p>
            </div>
            <div>
              <h4>How checks work</h4>
              <p>
                Checks are vision-model judgments with a confidence.
                Disagreements the monitor didn&apos;t flag are shown as
                uncertain, never as passes.
              </p>
            </div>
            <div>
              <h4>What &quot;learning&quot; means here</h4>
              <p>
                Persistent project memory and prompt adaptation. No model
                weights are trained.
              </p>
            </div>
          </div>
        </div>
      </div>
    </V4Site>
  );
}
