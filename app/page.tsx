import type { Metadata } from "next";
import { archiveEvidence } from "@/components/demo-evidence";
import cache from "@/seed/cache/manifest.json";
export const metadata: Metadata = { title: "Scripty — Productions" };
export default function Home() {
  const evidence = archiveEvidence(cache.batches);
  return (
    <div className="landing">
      <header className="brand-header">
        <a href="/" className="wordmark">
          scripty
        </a>
        <a className="pill secondary" href="/productions">
          Your productions
        </a>
      </header>
      <main className="landing-main">
        <div className="landing-copy">
          <h1>
            Your AI script
            <br />
            supervisor.
          </h1>
          <p>Catch drift. Keep your character.</p>
          <a className="pill primary landing-start" href="/productions/new">
            Start a new production
          </a>
          <a className="pill secondary landing-sample" href="/studio">
            Explore a sample production: Mara
          </a>
        </div>
        <div className="landing-portrait">
          <img
            src={evidence.heroImage}
            alt="Mara, the sample production's recurring character"
            fetchPriority="high"
          />
        </div>
      </main>
    </div>
  );
}
