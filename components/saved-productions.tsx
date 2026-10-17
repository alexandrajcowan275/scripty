"use client";

import { ProductionCard } from "./ui/production-card";
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
      <li
        className="v2-production-loading"
        role="status"
        aria-label="Opening your productions"
      >
        <div className="v2-skeleton" />
      </li>
    );
  if (failed)
    return (
      <li className="v2-production-message">
        <p role="alert">Couldn't open your productions.</p>
        <button
          className="v2-button v2-light"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </button>
      </li>
    );
  if (!items.length)
    return (
      <li className="v2-production-message">
        <p>Your own productions will appear here.</p>
      </li>
    );
  return (
    <>
      {items
        .filter((item) => item.project_id !== "mara")
        .map((item) => (
          <ProductionCard
            key={item.project_id}
            name={item.projects.name}
            href={`/p/${encodeURIComponent(item.project_id)}`}
            image={`/api/productions/${encodeURIComponent(item.project_id)}/reference`}
          />
        ))}
    </>
  );
}
