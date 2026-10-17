"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ShotImage } from "../shot-image";
import { MotionLink } from "./motion";
import { message, post, type ProductionData } from "../ui-v2/data";

export function Brand({
  api = false,
  light = false,
  href = "/dashboard",
}: {
  api?: boolean;
  light?: boolean;
  href?: string;
}) {
  return (
    <MotionLink href={href} className="v2-brand">
      <img
        src={light ? "/brand/scripty-light.svg" : "/brand/scripty.svg"}
        width="28"
        height="28"
        alt=""
      />
      scripty{api && <span>api</span>}
    </MotionLink>
  );
}
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="v2-kbd">{children}</kbd>;
}
export function Nav({
  id = "mara",
  active = "studio",
  data,
  context,
}: {
  context?: string;
  id?: string;
  active?: "studio" | "evidence" | "eval" | "api";
  data?: ProductionData | null;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <header className="v2-top">
      <div className="v2-top-left">
        <Brand api={active === "api"} />
        <div className="v2-project-switch">
          <button
            className="v2-button v2-light v2-project-button"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label="Choose production"
          >
            {data?.project.characters[0]?.referenceImageUrl && (
              <ShotImage
                src={data.project.characters[0].referenceImageUrl}
                alt=""
                variant="thumbnail"
                priority
              />
            )}
            <span>{data?.project.name ?? "—"}</span>
            <span aria-hidden="true">⌄</span>
          </button>
          {menu && (
            <div className="v2-switch-menu v2-glass">
              <MotionLink href="/dashboard">Your productions</MotionLink>
              <MotionLink href="/p/mara" onNavigate={() => setMenu(false)}>
                Mara · sample
              </MotionLink>
              <MotionLink href="/new" kind="start">
                Start a production
              </MotionLink>
            </div>
          )}
        </div>
      </div>
      <nav className="v2-tabs" aria-label="Production">
        <MotionLink
          href={`/p/${id}`}
          className={active === "studio" ? "on" : ""}
        >
          Studio
        </MotionLink>
        <MotionLink
          href={`/p/${id}/evidence`}
          kind="evidence"
          className={active === "evidence" ? "on" : ""}
        >
          Evidence
        </MotionLink>
        <MotionLink
          href={`/p/${id}/eval`}
          kind="eval"
          className={active === "eval" ? "on" : ""}
        >
          Eval
        </MotionLink>
        <MotionLink
          href="/developers"
          kind="receipt"
          className={active === "api" ? "on" : ""}
        >
          API
        </MotionLink>
      </nav>
      <div className="v2-top-right">
        <span className="v2-monitor-status v2-mono">
          {!context && <i />}
          {context ??
            (data
              ? id === "mara"
                ? "Sample production"
                : "Monitor ready"
              : "—")}
        </span>
        <MotionLink href="/new" kind="start" className="v2-button v2-small">
          + New
        </MotionLink>
      </div>
    </header>
  );
}
export function ActionDock({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`v2-action-dock v2-glass ${className}`}
      aria-label="Take actions"
    >
      {children}
    </div>
  );
}
export function ErrorNotice({
  children,
  retry,
}: {
  children: ReactNode;
  retry?: () => void;
}) {
  return (
    <div className="v2-error" role="alert">
      <span>{children}</span>
      {retry && (
        <button className="v2-text-button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function AccessDialog({
  open,
  onClose,
  onGranted,
}: {
  open: boolean;
  onClose: () => void;
  onGranted: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    if (!open) ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="v2-access-dialog v2-glass"
      aria-label="Production access"
      onCancel={onClose}
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await post("/api/access", { code });
            setCode("");
            onGranted();
            onClose();
          } catch (e) {
            setError(message(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="v2-dialog-top">
          <span className="v2-label">Production access</span>
          <button
            type="button"
            className="v2-close"
            onClick={onClose}
            aria-label="Close access"
          >
            ×
          </button>
        </div>
        <h2>The next take is yours.</h2>
        <p>Enter your access code to unlock generation and checking.</p>
        <label htmlFor="production-access">Access code</label>
        <input
          id="production-access"
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          autoFocus
        />
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <button className="v2-button" disabled={busy || !code.trim()}>
          {busy ? "Opening…" : "Open the set"}
        </button>
      </form>
    </dialog>
  );
}
