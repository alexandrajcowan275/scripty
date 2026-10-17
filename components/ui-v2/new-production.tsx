"use client";

import { useEffect, useState } from "react";
import { ShotImage } from "../shot-image";
import { AccessDialog, ActionDock, Brand, ErrorNotice } from "../ui/chrome";
import { Ambient, MotionLink, Scan, useMotionNavigation } from "../ui/motion";
import { message, money, modelLabel, post, request } from "./data";
import { useConfiguration } from "./config";

type Canon = {
  key: string;
  label: string;
  expected: string;
  weight: number;
  laterality?: "left" | "right" | "unclear" | "none";
  confidence?: number;
};
const needsSide = (item: Canon) =>
  /\bleft\b|\bright\b/i.test(item.expected) ||
  ["left", "right", "unclear"].includes(item.laterality ?? "");
export function NewProductionScreen() {
  const { config, refreshConfig } = useConfiguration(),
    navigate = useMotionNavigation();
  const [mode, setMode] = useState<"quick" | "studio">("quick"),
    [name, setName] = useState(""),
    [character, setCharacter] = useState(""),
    [preview, setPreview] = useState(""),
    [ticket, setTicket] = useState("");
  const [attributes, setAttributes] = useState<Canon[]>([]),
    [sides, setSides] = useState<Record<string, "left" | "right">>({}),
    [scenes, setScenes] = useState(""),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [access, setAccess] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const draft = JSON.parse(
        sessionStorage.getItem("scripty-v2-draft") ?? "null",
      );
      if (draft) {
        setName(draft.name ?? "");
        setCharacter(draft.character ?? "");
        setTicket(draft.ticket ?? "");
        setPreview(draft.preview ?? "");
        setAttributes(draft.attributes ?? []);
        setSides(draft.sides ?? {});
        setScenes(draft.scenes ?? "");
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        sessionStorage.setItem(
          "scripty-v2-draft",
          JSON.stringify({
            name,
            character,
            ticket,
            preview,
            attributes,
            sides,
            scenes,
          }),
        );
      } catch {}
  }, [ready, name, character, ticket, preview, attributes, sides, scenes]);
  async function readCanon(referenceTicket = ticket) {
    if (!referenceTicket || busy) return;
    if (!config?.authorized) {
      setAccess(true);
      return;
    }
    setBusy("canon");
    setError("");
    try {
      const result = await post<{ attributes: Canon[] }>(
        "/api/production/canon",
        { referenceTicket, characterName: character || undefined },
      );
      if (!Array.isArray(result.attributes) || !result.attributes.length)
        throw new Error("No details came back. Add your canon below.");
      setAttributes(result.attributes);
      setSides({});
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy("");
    }
  }
  async function upload(file: File) {
    if (busy) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Choose an image smaller than 4 MB.");
      return;
    }
    setBusy("upload");
    setError("");
    try {
      const form = new FormData();
      form.set("reference", file);
      const result = await request<{ ticket: string; imageUrl: string }>(
        "/api/productions/reference/upload",
        { method: "POST", body: form },
      );
      setTicket(result.ticket);
      setPreview(result.imageUrl);
      setAttributes([]);
      setSides({});
      if (config?.authorized) {
        setBusy("canon");
        const proposed = await post<{ attributes: Canon[] }>(
          "/api/production/canon",
          {
            referenceTicket: result.ticket,
            characterName: character || undefined,
          },
        );
        setAttributes(proposed.attributes ?? []);
      }
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy("");
    }
  }
  function removeCanon(key: string) {
    setAttributes((previous) => previous.filter((row) => row.key !== key));
    setSides((previous) =>
      Object.fromEntries(Object.entries(previous).filter(([id]) => id !== key)),
    );
  }
  function confirmSide(item: Canon, side: "left" | "right") {
    setSides((previous) => ({ ...previous, [item.key]: side }));
    setAttributes((previous) =>
      previous.map((row) =>
        row.key === item.key
          ? {
              ...row,
              laterality: side,
              expected: row.expected.replace(
                /\bleft\b|\bright\b/gi,
                side.toUpperCase(),
              ),
            }
          : row,
      ),
    );
  }
  const scenePrompts = scenes
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    unconfirmed = attributes.filter(
      (item) => needsSide(item) && !sides[item.key],
    );
  const valid = !!(
    name.trim() &&
    character.trim() &&
    ticket &&
    attributes.length &&
    attributes.every((item) => item.expected.trim()) &&
    scenePrompts.length > 0 &&
    scenePrompts.length <= 6 &&
    !unconfirmed.length
  );
  async function create() {
    if (!valid || busy) return;
    if (!config?.authorized) {
      setAccess(true);
      return;
    }
    setBusy("create");
    setError("");
    try {
      const form = new FormData();
      form.set("referenceTicket", ticket);
      form.set(
        "production",
        JSON.stringify({
          name: name.trim(),
          characterName: character.trim(),
          attributes: attributes.map(
            ({ key, label, expected, weight, laterality }) => ({
              key,
              label,
              expected,
              weight,
              laterality,
            }),
          ),
          scenePrompts,
          lateralityConfirmations: sides,
        }),
      );
      const result = await request<{ project: { id: string } }>(
        "/api/productions",
        { method: "POST", body: form },
      );
      if (!result.project?.id)
        throw new Error(
          "The production hasn’t returned yet. Your draft is safe.",
        );
      sessionStorage.removeItem("scripty-v2-draft");
      navigate(`/p/${result.project.id}?start=1`, "start");
    } catch (e) {
      setError(message(e));
      setBusy("");
    }
  }
  return (
    <div className="v2-screen v2-setup">
      <Ambient />
      <header className="v2-top">
        <Brand />
        <div className="v2-segment" role="group" aria-label="Production setup">
          <button
            className={mode === "quick" ? "on" : ""}
            onClick={() => setMode("quick")}
            aria-pressed={mode === "quick"}
          >
            Quick · one character
          </button>
          <button
            className={mode === "studio" ? "on" : ""}
            onClick={() => setMode("studio")}
            aria-pressed={mode === "studio"}
          >
            Studio · script
          </button>
        </div>
        <MotionLink href="/" className="v2-text-button">
          Cancel
        </MotionLink>
      </header>
      <main className="v2-setup-wrap">
        <label className="sr-only" htmlFor="production-title">
          Production name
        </label>
        <input
          id="production-title"
          className="v2-title-input"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your next production"
        />
        <p className="v2-muted">
          Drop a reference. Confirm what must stay the same.
        </p>
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <div className="v2-setup-grid">
          <section className="v2-setup-reference">
            <label
              className={`v2-upload ${preview ? "has-reference" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) void upload(file);
              }}
            >
              {preview ? (
                <ShotImage
                  src={preview}
                  alt={`${character || "Character"} reference`}
                  priority
                />
              ) : (
                <>
                  <ShotImage
                    src="/mara/reference.jpg"
                    alt="Mara, an example reference. Upload your own character."
                    priority
                  />
                  <span className="v2-upload-example v2-glass v2-mono">
                    Example · Mara
                  </span>
                  <span className="v2-upload-prompt v2-glass">
                    <strong>Cast your character.</strong>
                    <span>Drop your reference or choose an image.</span>
                  </span>
                </>
              )}
              {preview && attributes.length > 0 && (
                <div className="v2-reference-hud v2-glass">
                  <span className="v2-label">Character canon</span>
                  <ul>
                    {attributes.slice(0, 4).map((item) => (
                      <li
                        key={item.key}
                        className={
                          needsSide(item) && !sides[item.key]
                            ? "v2-memory-copy"
                            : ""
                        }
                      >
                        {item.expected}
                      </li>
                    ))}
                  </ul>
                  <span className="v2-mono">
                    {attributes.length}{" "}
                    {attributes.length === 1 ? "detail" : "details"} ·{" "}
                    {unconfirmed.length} to confirm
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={!!busy}
                aria-label={
                  preview
                    ? "Change character reference"
                    : "Upload character reference"
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
              {busy === "upload" || busy === "canon" ? <Scan /> : null}
            </label>
            <div className="v2-cast-tools">
              <label htmlFor="cast-name" className="v2-label">
                Cast
              </label>
              <input
                id="cast-name"
                aria-label="Character name"
                className="v2-field v2-character-name"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                maxLength={80}
                placeholder="Character name"
              />
              {preview && (
                <span className="v2-cast-chip">
                  <ShotImage src={preview} alt="" />
                  {character || "—"}
                </span>
              )}
              <button
                className="v2-button v2-light v2-small"
                disabled
                title="Additional cast support is not available yet"
              >
                + Character —
              </button>
              {mode === "studio" && (
                <button className="v2-button v2-light v2-small" disabled>
                  Location / prop —
                </button>
              )}
            </div>
            {ticket && (
              <button
                className="v2-text-button"
                disabled={!!busy}
                onClick={() => void readCanon()}
              >
                {busy === "canon"
                  ? "Reading the reference…"
                  : "Read canon from reference →"}
              </button>
            )}
          </section>
          <section className="v2-setup-details">
            <div className="v2-rail-heading">
              <span className="v2-label">Canon · checked on every shot</span>
              {attributes.length > 0 && (
                <span className="v2-label">Weight</span>
              )}
            </div>
            {attributes.map((item) => (
              <div
                className={`v2-canon-row ${needsSide(item) ? "has-side" : ""} ${needsSide(item) && !sides[item.key] ? "needs-confirm" : ""}`}
                key={item.key}
              >
                <div>
                  <label className="sr-only" htmlFor={`canon-${item.key}`}>
                    {item.label}
                  </label>
                  <input
                    id={`canon-${item.key}`}
                    className="v2-canon-input"
                    maxLength={200}
                    value={item.expected}
                    onChange={(e) => {
                      setAttributes((previous) =>
                        previous.map((row) =>
                          row.key === item.key
                            ? { ...row, expected: e.target.value }
                            : row,
                        ),
                      );
                      setSides((previous) => {
                        if (!(item.key in previous)) return previous;
                        const next = { ...previous };
                        delete next[item.key];
                        return next;
                      });
                    }}
                  />
                </div>
                <select
                  className="v2-weight"
                  aria-label={`${item.label} weight`}
                  value={item.weight}
                  onChange={(e) =>
                    setAttributes((previous) =>
                      previous.map((row) =>
                        row.key === item.key
                          ? { ...row, weight: Number(e.target.value) }
                          : row,
                      ),
                    )
                  }
                >
                  {[
                    0.5,
                    1,
                    2,
                    3,
                    4,
                    5,
                    ...(![0.5, 1, 2, 3, 4, 5].includes(item.weight)
                      ? [item.weight]
                      : []),
                  ]
                    .sort((a, b) => a - b)
                    .map((value) => (
                      <option key={value} value={value}>
                        {value}×
                      </option>
                    ))}
                </select>
                {needsSide(item) ? (
                  <div
                    className="v2-segment"
                    role="group"
                    aria-label={`${item.label}: anatomical side`}
                  >
                    {(["left", "right"] as const).map((side) => (
                      <button
                        key={side}
                        aria-pressed={sides[item.key] === side}
                        className={sides[item.key] === side ? "on" : ""}
                        onClick={() => confirmSide(item, side)}
                      >
                        {side}
                      </button>
                    ))}
                  </div>
                ) : null}
                <button
                  className="v2-close"
                  aria-label={`Remove ${item.label}`}
                  onClick={() => removeCanon(item.key)}
                >
                  ×
                </button>
              </div>
            ))}
            {!attributes.length && (
              <p className="v2-muted">Add what must stay the same.</p>
            )}
            <button
              className="v2-text-button"
              disabled={attributes.length >= 12 || !!busy}
              onClick={() =>
                setAttributes((previous) => [
                  ...previous,
                  {
                    key: `detail_${crypto.randomUUID().slice(0, 8)}`,
                    label: `Detail ${previous.length + 1}`,
                    expected: "",
                    weight: 1,
                    laterality: "none",
                  },
                ])
              }
            >
              + Add a canon detail
            </button>
            {unconfirmed.length > 0 && (
              <p className="v2-memory-copy">
                Their left. Their right. Confirm each side once.
              </p>
            )}
            <div className="v2-setup-scenes">
              <label htmlFor="take-scenes" className="v2-label">
                {mode === "studio"
                  ? "Script · one shot per line"
                  : "Shots for take 1"}
              </label>
              <textarea
                id="take-scenes"
                className="v2-field"
                rows={6}
                value={scenes}
                maxLength={12000}
                onChange={(e) => setScenes(e.target.value)}
                placeholder="One scene per line. Up to six shots."
              />
              <span className="v2-muted">
                {scenePrompts.length} / 6 shots
                {scenePrompts.length > 6
                  ? " · Split this into a smaller take."
                  : ""}
              </span>
              {mode === "studio" && (
                <label className="v2-text-button">
                  Import a text script
                  <input
                    className="sr-only"
                    type="file"
                    accept="text/plain,.txt"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setScenes((await file.text()).slice(0, 12000));
                    }}
                  />
                </label>
              )}
            </div>
          </section>
        </div>
      </main>
      <ActionDock className="v2-setup-dock">
        <span>
          Model{" "}
          <strong title={config?.imageModel}>
            {modelLabel(config?.imageModel ?? "—")}
          </strong>
        </span>
        <span>
          {scenePrompts.length} {scenePrompts.length === 1 ? "shot" : "shots"}
        </span>
        <span className="v2-mono">
          ≈{" "}
          {money(
            config?.observedImageCostUsd == null
              ? null
              : config.observedImageCostUsd * scenePrompts.length,
          )}
        </span>
        <button
          className="v2-button"
          disabled={!valid || !!busy}
          onClick={() => void create()}
        >
          {busy === "create" ? "Opening your set…" : "Generate take 1 →"}
        </button>
      </ActionDock>
      <AccessDialog
        open={access}
        onClose={() => setAccess(false)}
        onGranted={() => {
          void refreshConfig();
        }}
      />
    </div>
  );
}
