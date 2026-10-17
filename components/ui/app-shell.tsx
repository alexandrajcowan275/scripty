"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Rule } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "./chrome";
import { Icon, type IconName } from "../icons";
import { MotionLink } from "./motion";

const ShellContext = createContext<{
  register: (id: string, name: string) => void;
  remember: (id: string, rule: Rule) => void;
} | null>(null);
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname(),
    content = useRef<HTMLDivElement>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [memories, setMemories] = useState<Record<string, Rule>>({});
  const remember = useCallback(
    (id: string, rule: Rule) =>
      setMemories((previous) =>
        previous[id]?.id === rule.id && previous[id]?.text === rule.text
          ? previous
          : { ...previous, [id]: rule },
      ),
    [],
  );
  const register = useCallback(
    (id: string, name: string) =>
      setNames((previous) =>
        previous[id] === name ? previous : { ...previous, [id]: name },
      ),
    [],
  );
  const value = useMemo(() => ({ register, remember }), [register, remember]);
  const isApp =
    /^\/(dashboard|projects|productions|new|developers|p)(\/|$)/.test(path);
  const id = path.match(/^\/p\/([^/]+)/)?.[1],
    productionId = id ?? "mara";
  useEffect(() => {
    if (isApp && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      content.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: "ease-out",
      });
  }, [path, isApp]);
  const nav = (label: string, icon: IconName, href: string, on = false) => (
    <MotionLink
      key={label}
      href={href}
      className={`v2-dashboard-nav-item ${on ? "on" : ""}`}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </MotionLink>
  );
  if (!isApp) return children;
  return (
    <ShellContext.Provider value={value}>
      <div className="v2-app-shell v2-workspace">
        <aside className="v2-dashboard-sidebar v2-app-sidebar">
          <nav aria-label="Workspace" className="v2-dashboard-nav">
            <span className="v2-dashboard-group-label">Workspace</span>
            {nav("Home", "frame", "/dashboard", path === "/dashboard")}
            {nav(
              "Productions",
              "slate",
              "/projects",
              path === "/projects" || path === "/productions",
            )}
            {nav("New production", "plus", "/new", path === "/new")}
          </nav>
          <nav aria-label="Production" className="v2-dashboard-nav">
            <span className="v2-dashboard-group-label">
              {names[productionId] ??
                (productionId === "mara" ? "Mara" : "Production")}
            </span>
            {nav(
              "Studio",
              "slate",
              `/p/${productionId}`,
              path === `/p/${productionId}` || path.includes("/shot/"),
            )}
            <button
              className="v2-dashboard-nav-item"
              onClick={() => {
                const base = `/p/${productionId}`;
                if (path === base) {
                  window.dispatchEvent(
                    new CustomEvent("scripty:open-memory", {
                      detail: { projectId: productionId },
                    }),
                  );
                  return;
                }
                router.push(`${base}?panel=memory`, { scroll: false });
              }}
            >
              <Icon name="layers" />
              <span>Memory</span>
            </button>
            {nav(
              "Evidence",
              "activity",
              `/p/${productionId}/evidence`,
              path.endsWith("/evidence"),
            )}
            {nav(
              "Eval",
              "check",
              `/p/${productionId}/eval`,
              path.endsWith("/eval"),
            )}
          </nav>
          <nav aria-label="Platform" className="v2-dashboard-nav">
            <span className="v2-dashboard-group-label">Platform</span>
            {nav("API", "terminal", "/developers", path === "/developers")}
          </nav>
          {memories[productionId] && (
            <div className="v2-shell-memory" key={memories[productionId].id}>
              <span className="v2-label">Memory</span>
              <p>
                <i className="v2-memory-dot" />
                {memories[productionId].text}
              </p>
            </div>
          )}
        </aside>
        <div ref={content} className="v2-shell-page">
          {children}
        </div>
      </div>
    </ShellContext.Provider>
  );
}

export function AppPageHeader({
  title,
  id,
  productionName,
  memoryRules,
  action,
}: {
  title: string;
  id?: string;
  productionName?: string;
  memoryRules?: Rule[];
  action?: ReactNode;
}) {
  const shell = useContext(ShellContext);
  const latestRule = [...(memoryRules ?? [])]
    .filter((rule) => rule.source !== "seed")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  useEffect(() => {
    if (latestRule) shell?.remember(id ?? "mara", latestRule);
  }, [id, latestRule, shell?.remember]);
  useEffect(() => {
    if (id && productionName) shell?.register(id, productionName);
  }, [id, productionName, shell?.register]);
  return (
    <header className="v2-app-header">
      <div className="v2-app-header-left">
        <Brand light href="/" />
        <nav aria-label="Breadcrumb" className="v2-app-breadcrumb">
          <MotionLink href="/dashboard">Home</MotionLink>
          {id && (
            <>
              <span>/</span>
              <MotionLink href={`/p/${id}`}>
                {productionName ?? (id === "mara" ? "Mara" : "Production")}
              </MotionLink>
            </>
          )}
          {title !== "Home" && (
            <>
              <span>/</span>
              <span aria-current="page">{title}</span>
            </>
          )}
        </nav>
        <h1 className="v2-sr-title">{title}</h1>
      </div>
      {action ?? (
        <MotionLink href="/new" kind="start" className="v2-button">
          <Icon name="plus" />
          New production
        </MotionLink>
      )}
    </header>
  );
}
