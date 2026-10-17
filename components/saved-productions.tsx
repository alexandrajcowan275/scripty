"use client";

import { MotionLink } from "./ui/motion";
import { useEffect, useState } from "react";

type SavedProduction = { project_id: string; projects: { name: string } };
export function SavedProductions() {
  const [items, setItems] = useState<SavedProduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    fetch("/api/productions", {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not open productions");
        const data = await response.json();
        if (!Array.isArray(data.productions))
          throw new Error("Invalid productions");
        if (!controller.signal.aborted)
          setItems(
            data.productions.filter(
              (item: SavedProduction) =>
                typeof item.project_id === "string" &&
                typeof item.projects?.name === "string",
            ),
          );
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  if (loading)
    return (
      <div
        className="production-list-skeleton"
        role="status"
        aria-label="Opening your productions"
      />
    );
  if (failed)
    return (
      <div className="production-list-message">
        <p role="alert">Couldn't open your productions.</p>
        <button
          className="pill secondary"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </button>
      </div>
    );
  if (!items.length)
    return (
      <div className="production-list-message">
        <p>No productions yet.</p>
      </div>
    );
  return (
    <ul className="production-list" aria-label="Saved productions">
      {items.map((item) => (
        <li key={item.project_id}>
          <MotionLink href={`/p/${encodeURIComponent(item.project_id)}`}>
            <span>{item.projects.name}</span>
            <span className="production-open" aria-hidden="true">
              →
            </span>
            <span className="sr-only">Open production</span>
          </MotionLink>
        </li>
      ))}
    </ul>
  );
}
