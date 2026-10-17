"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Shot } from "@/lib/types";
import { originalImageSource } from "../image-source";
import { ShotImage } from "../shot-image";
import { Brackets, Scan } from "./motion";
import {
  checkLabel,
  confidence,
  failedCheck,
  frameName,
  sharedShot,
  sceneCaption,
  unclear,
  type Check,
  type ProductionData,
} from "../ui-v2/data";
function regionFor(check?: Check) {
  const region = check?.location;
  return region &&
    region.units !== "pixels" &&
    [region.x, region.y, region.width, region.height].every(
      (n) => Number.isFinite(n) && n >= 0 && n <= 1,
    ) &&
    region.width > 0 &&
    region.height > 0
    ? region
    : undefined;
}
export function InspectImage({
  shot,
  data,
  scanning = false,
  shared = true,
}: {
  shot: Shot;
  data: ProductionData;
  scanning?: boolean;
  shared?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null),
    loupe = useRef<HTMLDivElement>(null);
  const [loupeShot, setLoupeShot] = useState<string | null>(null);
  const loupeOn = loupeShot === shot.id;
  const check = failedCheck(shot),
    region = regionFor(check);
  function position(x: number, y: number, follow: boolean) {
    if (!stage.current || !loupe.current) return;
    const img = stage.current.querySelector("img");
    if (!img?.naturalWidth) return;
    const width = stage.current.clientWidth,
      height = stage.current.clientHeight,
      scale = Math.min(width / img.naturalWidth, height / img.naturalHeight),
      iw = img.naturalWidth * scale,
      ih = img.naturalHeight * scale;
    const sx = Math.max(0, Math.min(1, (x * width - (width - iw) / 2) / iw)),
      sy = Math.max(0, Math.min(1, (y * height - (height - ih) / 2) / ih));
    const size = loupe.current.offsetWidth || 190;
    loupe.current.style.backgroundSize = `${iw * 4}px ${ih * 4}px`;
    loupe.current.style.backgroundPosition = `${size / 2 - sx * iw * 4}px ${size / 2 - sy * ih * 4}px`;
    if (follow) {
      loupe.current.style.left = `${Math.min(width - size / 2 - 8, Math.max(size / 2 + 8, x * width))}px`;
      loupe.current.style.top = `${Math.min(height - size / 2 - 8, Math.max(size / 2 + 8, y * height))}px`;
      loupe.current.style.bottom = "auto";
      loupe.current.style.transform = "translate(-50%,-50%)";
    } else {
      loupe.current.style.left = "22px";
      loupe.current.style.top = "auto";
      loupe.current.style.bottom = "22px";
      loupe.current.style.transform = "none";
    }
  }
  useEffect(() => {
    const rest = () =>
      position(
        region ? region.x + region.width / 2 : 0.5,
        region ? region.y + region.height / 2 : 0.5,
        false,
      );
    const img = stage.current?.querySelector("img");
    img?.addEventListener("load", rest);
    rest();
    const observer = new ResizeObserver(rest);
    if (stage.current) observer.observe(stage.current);
    return () => {
      img?.removeEventListener("load", rest);
      observer.disconnect();
    };
  }, [shot.id, loupeOn, region?.x, region?.y, region?.width, region?.height]);
  return (
    <div
      ref={stage}
      className={`v2-inspect-stage ${shot.flagged ? "flagged" : ""}`}
      data-viewfinder
      tabIndex={0}
      aria-label="Inspect the shot. Move over the image to magnify details."
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          !loupeOn ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const rect = e.currentTarget.getBoundingClientRect();
        position(
          (e.clientX - rect.left) / rect.width,
          (e.clientY - rect.top) / rect.height,
          true,
        );
      }}
      onPointerLeave={() =>
        position(
          region ? region.x + region.width / 2 : 0.5,
          region ? region.y + region.height / 2 : 0.5,
          false,
        )
      }
    >
      <ShotImage
        src={shot.imageUrl}
        alt={shot.scenePrompt}
        priority
        style={
          shared
            ? ({ viewTransitionName: sharedShot(shot.id) } as CSSProperties)
            : undefined
        }
      />
      <span className="v2-review-frame v2-glass v2-mono">
        {frameName(shot, data)} · {sceneCaption(shot)}
      </span>
      {shot.flagged && (
        <>
          <Brackets region={region} />
          <div className="v2-glass v2-drift-callout">
            <strong>
              {check
                ? `${checkLabel(check.key, data)} needs a second look.`
                : "Continuity flagged."}
            </strong>
            <span className="v2-mono">
              {check
                ? `canon: ${check.expected} · confidence ${confidence(check.confidence)}`
                : "Precise location unavailable"}
            </span>
          </div>
        </>
      )}
      {loupeOn && (
        <div
          ref={loupe}
          className="v2-loupe"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${JSON.stringify(originalImageSource(shot.imageUrl))})`,
          }}
        />
      )}
      <button
        className="v2-loupe-label v2-glass v2-mono"
        onClick={() => setLoupeShot(loupeOn ? null : shot.id)}
        aria-pressed={loupeOn}
      >
        Loupe 4× {loupeOn ? "on" : "off"}
      </button>
      <Scan active={scanning} />
    </div>
  );
}
export function CheckList({
  shot,
  data,
}: {
  shot: Shot;
  data: ProductionData;
}) {
  const fixed = shot.checks.filter((c) => !c.key.startsWith("rule:"));
  const learned = data.rules.filter(
    (r) =>
      r.source !== "seed" && shot.checks.some((c) => c.key === `rule:${r.id}`),
  );
  return (
    <div className="v2-check-list">
      {[...(fixed.length ? fixed : shot.checks)]
        .sort(
          (a, b) =>
            Number(!b.pass && !unclear(b)) - Number(!a.pass && !unclear(a)),
        )
        .map((check) => {
          const uncertain = unclear(check),
            failed = !check.pass && !uncertain,
            learnedCheck = learned.some((r) => r.attributeKey === check.key);
          return (
            <details
              className={`v2-check ${failed ? "failed" : uncertain ? "uncertain" : ""}`}
              key={`${shot.id}-${check.key}`}
            >
              <summary
                title={`Canon: ${check.expected}. Observed: ${check.observed}. Expand for the full check.`}
              >
                <span className="v2-check-caption">
                  <strong>{checkLabel(check.key, data)}</strong>
                  <span className="v2-check-observed"> · {check.expected}</span>
                  {learnedCheck && (
                    <i
                      className="v2-memory-dot"
                      title="Checked by a learned rule"
                    />
                  )}
                </span>
                <span className="v2-mono">
                  {uncertain ? "?" : check.pass ? "✓" : "✕"}{" "}
                  {confidence(check.confidence)}
                </span>
                <span
                  className="v2-confidence-track"
                  aria-label={`Model-reported confidence ${confidence(check.confidence)}`}
                  style={
                    {
                      "--confidence": Number.isFinite(check.confidence)
                        ? Math.min(1, Math.max(0, check.confidence))
                        : 0,
                    } as CSSProperties
                  }
                >
                  <i />
                </span>
              </summary>
              <div className="v2-check-detail">
                <p>{check.observed}</p>
                <p>Canon: {check.expected}</p>
                {check.note && <p>{check.note}</p>}
              </div>
            </details>
          );
        })}
      {!shot.checks.length && (
        <p className="v2-muted">Checks haven’t returned yet. —</p>
      )}
      {learned.length > 0 && (
        <p className="v2-check-rule-note">
          <i className="v2-memory-dot" /> {learned.length} learned{" "}
          {learned.length === 1 ? "rule was" : "rules were"} checked on this
          shot.
        </p>
      )}
    </div>
  );
}
