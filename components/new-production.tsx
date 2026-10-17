"use client";
import { useEffect, useRef, useState } from "react";
type Step = "name" | "character" | "description" | "canon" | "scenes";
const scenesFor = (name: string) =>
  [
    `${name} arrives at a quiet station at dawn.`,
    `${name} waits beside a cafe window in soft daylight.`,
    `${name} climbs stone steps at golden hour.`,
    `${name} reads a map under a streetlamp at night.`,
    `${name} opens a door in a warmly lit corridor.`,
    `${name} arranges photographs on a table in daylight.`,
  ].join("\n");
export function NewProduction() {
  const [step, setStep] = useState<Step>("name"),
    [name, setName] = useState(""),
    [character, setCharacter] = useState(""),
    [description, setDescription] = useState(""),
    [ticket, setTicket] = useState(""),
    [preview, setPreview] = useState(""),
    [attributes, setAttributes] = useState<string[]>([]),
    [detail, setDetail] = useState(""),
    [scenes, setScenes] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const [draftReady, setDraftReady] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("scripty-production-draft-v1");
      if (raw) {
        const draft = JSON.parse(raw);
        if (!draft.completed) {
          setName(draft.name ?? "");
          setCharacter(draft.character ?? "");
          setDescription(draft.description ?? "");
          setTicket(draft.ticket ?? "");
          setPreview(draft.preview ?? "");
          setAttributes(draft.attributes ?? []);
          setScenes(draft.scenes ?? "");
        }
      }
    } catch {}
    setDraftReady(true);
  }, []);
  useEffect(() => {
    if (!draftReady) return;
    try {
      sessionStorage.setItem(
        "scripty-production-draft-v1",
        JSON.stringify({
          name,
          character,
          description,
          ticket,
          preview,
          attributes,
          scenes,
        }),
      );
    } catch {}
  }, [
    draftReady,
    name,
    character,
    description,
    ticket,
    preview,
    attributes,
    scenes,
  ]);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const back = () => {
    setError("");
    setStep(
      step === "scenes"
        ? "canon"
        : step === "canon"
          ? "character"
          : step === "description"
            ? "character"
            : "name",
    );
  };
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) {
        e.preventDefault();
        back();
      }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [step, busy]);
  function next() {
    setError("");
    if (step === "name") {
      if (!name.trim()) {
        setError("Add a production name.");
        return;
      }
      setStep("character");
    } else if (step === "character") {
      if (!character.trim() || !ticket) return;
      setStep("canon");
    } else if (step === "canon") {
      const nextDetails = [
        ...attributes.map((s) => s.trim()).filter(Boolean),
        ...(detail.trim() ? [detail.trim()] : []),
      ];
      const unique = [...new Set(nextDetails)];
      if (!unique.length) {
        setError("Add a canon detail.");
        return;
      }
      setAttributes(unique);
      setDetail("");
      if (!scenes.trim()) setScenes(scenesFor(character.trim()));
      setStep("scenes");
    }
  }
  async function upload(file: File) {
    if (busy) return;
    setError("");
    if (file.size > 4 * 1024 * 1024) {
      setError("That image didn't load. Choose another.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.set("reference", file);
      const response = await fetch("/api/productions/reference/upload", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(45000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTicket(data.ticket);
      setPreview(data.imageUrl);
    } catch {
      setError("That image didn't load. Choose another.");
    } finally {
      setBusy(false);
    }
  }
  async function generateReference() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/productions/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: character, description }),
        signal: AbortSignal.timeout(170000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Reference generation is unavailable.");
      setTicket(data.ticket);
      setPreview(data.imageUrl);
      setStep("character");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Reference generation is unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function create() {
    if (busy) return;
    const lines = scenes
      .trim()
      .split(/\r?\n/)
      .map((s) => s.trim());
    if (lines.length !== 6 || lines.some((s) => !s)) {
      setError("Write six scenes, one per line.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set(
        "production",
        JSON.stringify({
          name,
          characterName: character,
          attributes,
          scenePrompts: lines,
        }),
      );
      form.set("referenceTicket", ticket);
      const response = await fetch("/api/productions", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(45000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Your production could not be saved.");
      try {
        sessionStorage.setItem(
          "scripty-production-draft-v1",
          JSON.stringify({
            name,
            character,
            description,
            ticket,
            preview,
            attributes,
            scenes,
            completed: true,
          }),
        );
      } catch {}
      window.location.assign(`/studio?id=${data.project.id}&start=1`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't save this production. Try again.",
      );
      setBusy(false);
    }
  }
  const title = {
    name: "What's this production called?",
    character: "Add your character.",
    description: "Picture your character.",
    canon: "What must stay the same?",
    scenes: "What happens in this take?",
  }[step];
  return (
    <div className="setup-app">
      <header className="brand-header">
        <a href="/" className="wordmark">
          scripty
        </a>
      </header>
      <main className="setup-main">
        <h1 ref={heading} tabIndex={-1}>
          {title}
        </h1>
        {step === "name" ? (
          <>
            <label className="sr-only" htmlFor="production-name">
              Production name
            </label>
            <textarea
              id="production-name"
              className={`production-name ${name.length > 60 ? "long" : ""}`}
              value={name}
              maxLength={100}
              rows={1}
              onChange={(e) => setName(e.target.value)}
              placeholder="Night Shift"
              autoComplete="off"
            />
          </>
        ) : null}
        {step === "character" ? (
          <div className="setup-column">
            <label className="sr-only" htmlFor="character-name">
              Character name
            </label>
            <input
              id="character-name"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              maxLength={80}
              placeholder="Character name"
            />
            <label className="upload-bed" htmlFor="character-reference">
              {preview ? (
                <img
                  src={preview}
                  alt={`${character || "Character"} reference`}
                  onError={() => {
                    setTicket("");
                    setPreview("");
                    setError("That image didn't load. Choose another.");
                  }}
                />
              ) : (
                <span>
                  {busy
                    ? "Saving your reference…"
                    : "Drop a reference, or choose a file."}
                </span>
              )}
              <input
                id="character-reference"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
                aria-label={
                  preview
                    ? "Change character reference"
                    : "Upload character reference"
                }
              />
            </label>
            <button
              className="pill secondary"
              onClick={() => {
                setStep("description");
                setError("");
              }}
              disabled={busy}
            >
              Or describe them
            </button>
          </div>
        ) : null}
        {step === "description" ? (
          <>
            <label className="sr-only" htmlFor="character-description">
              Character description
            </label>
            <textarea
              id="character-description"
              className="description-input"
              value={description}
              maxLength={1200}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Their look, wardrobe and distinguishing details."
            />
            <button
              className="pill primary generate-reference"
              onClick={() => void generateReference()}
              disabled={
                busy || !character.trim() || description.trim().length < 8
              }
            >
              {busy ? "Creating your reference…" : "Generate reference"}
            </button>
            <button
              className="pill secondary setup-upload-alternative"
              onClick={() => {
                setStep("character");
                setError("");
              }}
              disabled={busy}
            >
              Upload a reference instead
            </button>
          </>
        ) : null}
        {step === "canon" ? (
          <div className="setup-wide">
            <div className="canon-fields">
              {attributes.map((value, index) => (
                <div className="canon-field" key={index}>
                  <label className="sr-only" htmlFor={`canon-${index}`}>
                    Canon detail {index + 1}
                  </label>
                  <input
                    id={`canon-${index}`}
                    value={value}
                    maxLength={200}
                    onChange={(e) =>
                      setAttributes(
                        attributes.map((item, i) =>
                          i === index ? e.target.value : item,
                        ),
                      )
                    }
                  />
                  <button
                    aria-label={`Remove ${value || `detail ${index + 1}`}`}
                    onClick={() =>
                      setAttributes(attributes.filter((_, i) => i !== index))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <label className="sr-only" htmlFor="canon-add">
              Add a detail
            </label>
            <input
              id="canon-add"
              className="canon-add"
              value={detail}
              maxLength={200}
              placeholder="Add a detail"
              onChange={(e) => setDetail(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  detail.trim() &&
                  attributes.length < 12
                ) {
                  e.preventDefault();
                  setAttributes([...attributes, detail.trim()]);
                  setDetail("");
                }
              }}
            />
          </div>
        ) : null}
        {step === "scenes" ? (
          <>
            <p className="setup-helper">Write one scene per line.</p>
            <label className="sr-only" htmlFor="scene-prompts">
              Six scene prompts
            </label>
            <textarea
              id="scene-prompts"
              className="setup-scenes"
              value={scenes}
              maxLength={12000}
              onChange={(e) => setScenes(e.target.value)}
              rows={6}
            />
          </>
        ) : null}
        {error ? (
          <p className="setup-error" role="alert">
            {error}
          </p>
        ) : null}
        {step !== "description" ? (
          <button
            className="pill primary setup-continue"
            disabled={
              busy || (step === "character" && (!ticket || !character.trim()))
            }
            onClick={() => (step === "scenes" ? void create() : next())}
          >
            {busy ? "Saving…" : step === "scenes" ? "Generate" : "Continue"}
          </button>
        ) : null}
      </main>
    </div>
  );
}
