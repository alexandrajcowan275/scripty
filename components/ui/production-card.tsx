"use client";
import { ShotImage } from "../shot-image";
import { MotionLink, Tilt } from "./motion";

export function ProductionCard({
  name,
  image,
  href,
  sample = false,
}: {
  name: string;
  image: string;
  href: string;
  sample?: boolean;
}) {
  return (
    <li className="v2-production-entry">
      <Tilt>
        <MotionLink
          href={href}
          kind={sample ? "mara" : "page"}
          className="v2-production-card"
        >
          <span className="v2-production-media" data-viewfinder>
            <ShotImage
              src={image}
              alt={`${name}, production reference`}
              priority
            />
            {sample && (
              <span className="v2-frame-tag v2-glass">Sample production</span>
            )}
          </span>
          <div className="v2-production-caption">
            <h2>{name}</h2>
            <span aria-hidden="true">↗</span>
          </div>
        </MotionLink>
      </Tilt>
    </li>
  );
}
