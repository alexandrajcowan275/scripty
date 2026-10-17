import Link from "next/link";
import type { ReactNode } from "react";
import { publicNavigation } from "@/lib/navigation";
import styles from "./public-site.module.css";

export function PublicSite({ active, children }: { active: "API" | "Evidence"; children: ReactNode }) {
  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Scripty home">
          <img src="/brand/scripty-light.svg" alt="" width="28" height="28" />
          <span>scripty</span>
        </Link>
        <nav aria-label="Public website" className={styles.navigation}>
          {publicNavigation.map(({ label, href }) => (
            <Link key={label} href={href} aria-current={label === active ? "page" : undefined} className={label === "Open studio" ? styles.button : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <Link href="/" className={styles.brand}>scripty</Link>
        <span>Every correction carries forward.</span>
        <nav aria-label="Footer"><Link href="/developers">API</Link><Link href="/evidence">Evidence</Link><Link href="/dashboard">Open studio ↗</Link></nav>
      </footer>
    </div>
  );
}
