import Link from "next/link";
import type { ReactNode } from "react";
import "./v4.css";
export function V4Site({
  active,
  children,
}: {
  active: "API" | "Evidence";
  children: ReactNode;
}) {
  return (
    <div className={`v4-public ${active === "API" ? "v4-api" : "v4-evidence"}`}>
      <nav className="pub" aria-label="Public website">
        <Link className="logo" href="/" aria-label="Scripty home">
          <img src="/brand/scripty-light.svg" width="26" height="26" alt="" />
          scripty
        </Link>
        <div className="lk">
          <Link href="/#how">Product</Link>
          <Link
            className={active === "API" ? "on" : ""}
            href="/developers"
            aria-current={active === "API" ? "page" : undefined}
          >
            API
          </Link>
          <Link
            className={active === "Evidence" ? "on" : ""}
            href="/evidence"
            aria-current={active === "Evidence" ? "page" : undefined}
          >
            Evidence
          </Link>
          <Link className="cta" href="/dashboard">
            Open studio
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
