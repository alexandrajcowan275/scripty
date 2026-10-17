"use client";
import type { CSSProperties } from "react";
import type { Shot } from "@/lib/types";
import type { ImageVariant } from "../image-source";
import { ShotImage } from "../shot-image";
import { Tilt, MotionLink, Brackets } from "./motion";
import {
  shotStatus,
  frameName,
  sharedShot,
  sceneCaption,
  type ProductionData,
} from "../ui-v2/data";
export function ShotCard({
  shot,
  data,
  index = 0,
  openTake = false,
  imageVariant = "thumbnail",
}: {
  shot: Shot;
  data: ProductionData;
  index?: number;
  openTake?: boolean;
  imageVariant?: ImageVariant;
}) {
  const status = shotStatus(shot);
  const location = shot.checks.find((c) => !c.pass && "location" in c) as
    | {
        location?: {
          x: number;
          y: number;
          width: number;
          height: number;
          units?: string;
        };
      }
    | undefined;
  const region =
    location?.location &&
    location.location.units !== "pixels" &&
    [
      location.location.x,
      location.location.y,
      location.location.width,
      location.location.height,
    ].every((n) => n >= 0 && n <= 1)
      ? location.location
      : undefined;
  return (
    <Tilt
      className="v2-shot-enter"
      style={{ "--shot-order": index } as CSSProperties}
    >
      <MotionLink
        href={
          openTake
            ? `/p/${data.project.id}?take=${shot.batchId}`
            : `/p/${data.project.id}/shot/${shot.id}`
        }
        kind={openTake ? "mara" : "shot"}
        className={`v2-shot-card ${shot.flagged ? "flagged" : ""}`}
      >
        <span className="v2-shot-media" data-viewfinder>
          <ShotImage
            src={shot.imageUrl}
            variant={imageVariant}
            alt={shot.scenePrompt}
            priority={index < 6}
            style={{ viewTransitionName: sharedShot(shot.id) } as CSSProperties}
          />
          <span
            className="v2-frame-tag v2-glass v2-mono"
            title={shot.scenePrompt}
          >
            {frameName(shot, data)} · {sceneCaption(shot)}
          </span>
          <span
            className={`v2-status-tag ${status.kind} ${status.kind === "drift" ? "v2-drift-fill" : "v2-glass"}`}
          >
            <span>
              {status.kind === "drift"
                ? status.label.replace(/^./, (letter) => letter.toUpperCase())
                : status.detail}
            </span>
            {status.kind === "drift"
              ? ` · ${status.detail}`
              : status.kind === "pass"
                ? " on-model"
                : status.label === "Check pending"
                  ? " Check pending"
                  : ` ${status.label}`}
          </span>
          {shot.flagged && <Brackets region={region} />}
        </span>
      </MotionLink>
    </Tilt>
  );
}

export function SharedShotImage({
  shot,
  priority = false,
}: {
  shot: Shot;
  priority?: boolean;
}) {
  return (
    <ShotImage
      src={shot.imageUrl}
      alt={shot.scenePrompt}
      priority={priority}
      style={{ viewTransitionName: sharedShot(shot.id) } as CSSProperties}
    />
  );
}
