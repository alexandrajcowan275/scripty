"use client";

import { useState, type ReactNode } from "react";
import { MotionLink } from "./motion";

const scenes = [
  {
    file: "mountains",
    description: "Fog crossing a forested mountain range",
    photographer: "Andreas Ebner",
  },
  {
    file: "dunes",
    description: "Small figures crossing vast desert dunes at twilight",
    photographer: "Stephen Leonardi",
  },
  {
    file: "camera",
    description: "A cinema camera under dramatic studio light",
    photographer: "Caleb Oquendo",
  },
  {
    file: "set",
    description: "A camera rig on an outdoor film set",
    photographer: "Maksim Romashkin",
  },
];

/** Licensed photography sets the scene; the real Mara evidence follows below. */
export function CinematicHero({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <section
      className={`v2-cinema ${paused ? "is-paused" : ""}`}
      aria-labelledby="cinema-title"
    >
      <div className="v2-cinema-scenes" aria-hidden="true">
        {scenes.map((scene, index) => (
          <picture
            className={`v2-cinema-scene v2-cinema-scene-${index + 1}`}
            key={scene.file}
          >
            <source
              media="(max-width: 760px)"
              srcSet={`/brand/cinema-${scene.file}-small.webp`}
            />
            <img
              src={`/brand/cinema-${scene.file}.webp`}
              alt=""
              decoding="async"
              fetchPriority={index === 0 ? "high" : "low"}
            />
          </picture>
        ))}
      </div>
      <div className="v2-cinema-nav">{children}</div>
      <div className="v2-cinema-copy">
        <span className="v2-cinema-label">
          Scripty / Your AI script supervisor
        </span>
        <h1 id="cinema-title">
          More of every film will be generated, shot by shot.{" "}
          <span>Scripty keeps the story straight.</span>
        </h1>
        <MotionLink href="/new" kind="start" className="v2-button">
          Start a production →
        </MotionLink>
      </div>
      <div className="v2-cinema-foot">
        <a href="#product">See Scripty at work ↓</a>
        <div>
          <a href="/brand/CREDITS.md">Photography credits</a>
          <button
            className="v2-cinema-pause"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "Play scenes" : "Pause scenes"}
          </button>
        </div>
      </div>
    </section>
  );
}
