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
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "./chrome";
import { Icon, type IconName } from "../icons";
import { MotionLink } from "./motion";
import { OverviewDialog } from "./production-overview";
import { LocationReference } from "./location-reference";

const ShellContext = createContext<{
  register: (id: string, name: string) => void;
} | null>(null);
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname(),
    content = useRef<HTMLDivElement>(null);
  const [names, setNames] = useState<Record<string, string>>({}),
    [locations, setLocations] = useState(false);
  const register = useCallback(
    (id: string, name: string) =>
      setNames((previous) =>
        previous[id] === name ? previous : { ...previous, [id]: name },
      ),
    [],
  );
  const value = useMemo(() => ({ register }), [register]);
  const isApp =
    /^\/(dashboard|projects|productions|new|developers|p)(\/|$)/.test(path);
  const id = path.match(/^\/p\/([^/]+)/)?.[1],
    productionId = id ?? "mara";
  useEffect(() => {
    if (isApp && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      content.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 150,
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
          <Brand />
          <nav aria-label="Workspace" className="v2-dashboard-nav">
            {nav("Home", "frame", "/dashboard", path === "/dashboard")}
            {nav("Productions", "slate", "/projects", path === "/projects")}
            {id && (
              <div className="v2-shell-production">
                <span title={names[id] ?? "Production"}>
                  {names[id] ?? (id === "mara" ? "Mara" : "Production")}
                </span>
                <div>
                  {[
                    ["Studio", `/p/${id}`],
                    ["Evidence", `/p/${id}/evidence`],
                    ["Eval", `/p/${id}/eval`],
                  ].map(([label, href]) => (
                    <MotionLink
                      href={href}
                      className={
                        path === href ||
                        (label === "Studio" && path.includes("/shot/"))
                          ? "on"
                          : ""
                      }
                      key={label}
                    >
                      {label}
                    </MotionLink>
                  ))}
                </div>
              </div>
            )}
            <button
              className="v2-dashboard-nav-item"
              onClick={() => {
                const base = `/p/${productionId}`;
                const query = new URLSearchParams(
                  window.location.pathname === base
                    ? window.location.search
                    : "",
                );
                if (path === base) {
                  window.dispatchEvent(
                    new CustomEvent("scripty:open-memory", {
                      detail: { projectId: productionId },
                    }),
                  );
                  return;
                }
                query.set("panel", "memory");
                router.push(`${base}?${query}`, { scroll: false });
              }}
            >
              <Icon name="layers" />
              <span>Memory</span>
            </button>
            {nav(
              "Evidence",
              "activity",
              `/p/${productionId}/evidence`,
              !id && path.endsWith("/evidence"),
            )}
            {nav(
              "Eval",
              "check",
              `/p/${productionId}/eval`,
              !id && path.endsWith("/eval"),
            )}
            {nav("API", "terminal", "/developers", path === "/developers")}
          </nav>
          <div className="v2-dashboard-products">
            <span className="v2-dashboard-group-label">Products</span>
            <nav aria-label="Products">
              <button
                className="v2-dashboard-nav-item"
                onClick={() => setLocations(true)}
              >
                <Icon name="image" />
                <span>Locations</span>
              </button>
              {["Video", "Team"].map((label) => (
                <button className="v2-dashboard-nav-item" disabled key={label}>
                  <Icon name={label === "Video" ? "play" : "layers"} />
                  <span>{label}</span>
                  <small>Soon</small>
                </button>
              ))}
            </nav>
          </div>
        </aside>
        <div ref={content} className="v2-shell-page">
          {children}
        </div>
        {locations && (
          <OverviewDialog
            title="Locations · Mara"
            onClose={() => setLocations(false)}
          >
            <LocationReference projectId="mara" />
          </OverviewDialog>
        )}
      </div>
    </ShellContext.Provider>
  );
}

export function AppPageHeader({
  title,
  id,
  productionName,
  action,
}: {
  title: string;
  id?: string;
  productionName?: string;
  action?: ReactNode;
}) {
  const shell = useContext(ShellContext);
  useEffect(() => {
    if (id && productionName) shell?.register(id, productionName);
  }, [id, productionName, shell?.register]);
  return (
    <header className="v2-app-header">
      <div>
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
        <h1>{title}</h1>
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
