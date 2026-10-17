"use client";

import { useEffect, useState } from "react";
import { request } from "../ui-v2/data";
import { ShotImage } from "../shot-image";

type Location = {
  id: string;
  name: string;
  imageUrl: string;
  provenance: string;
  marbleAccess?: string;
};

/** A reviewed still is context, not evidence of location-aware checking. */
export function LocationReference({ projectId }: { projectId: string }) {
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    setLocations([]);
    request<{ locations: Location[] }>(
      `/api/project/${encodeURIComponent(projectId)}/locations`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted && Array.isArray(result.locations)) {
          setLocations(
            result.locations.filter(
              (location) => location.imageUrl && location.name,
            ),
          );
        }
      })
      .catch(() => {
        // Optional context must not interrupt the working shot-review path.
      });
    return () => controller.abort();
  }, [projectId]);
  if (!locations.length) return null;
  return (
    <section className="v2-location-reference" aria-label="Location references">
      <h2 className="v2-label">Location reference</h2>
      {locations.map((location) => (
        <figure key={location.id}>
          <ShotImage
            src={location.imageUrl}
            alt={`${location.name}, captured location reference`}
          />
          <figcaption>
            <strong>{location.name}</strong>
            <span className="v2-muted">Captured still</span>
            {location.provenance === "marble_capture" && (
              <span
                className="v2-private-world"
                title="This Marble world requires permission. The captured still is available here."
              >
                Private Marble world
              </span>
            )}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
