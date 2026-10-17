import type { Metadata } from "next";
import { SavedProductions } from "@/components/saved-productions";
export const metadata: Metadata = { title: "Scripty — Your productions" };
export default function ProductionsPage() {
  return (
    <div>
      <header className="brand-header">
        <a href="/" className="wordmark">
          scripty
        </a>
      </header>
      <main className="productions-screen page-grid">
        <h1>Your productions.</h1>
        <SavedProductions />
        <a href="/productions/new" className="pill primary productions-create">
          Start a new production
        </a>
      </main>
    </div>
  );
}
