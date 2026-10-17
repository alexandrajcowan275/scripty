import { Icon } from "@/components/icons";
import { archiveEvidence } from "@/components/demo-evidence";
import cache from "@/seed/cache/manifest.json";
export default function LearningPage() {
  const evidence = archiveEvidence(cache.batches);
  const first = evidence.takes[0];
  const latest = evidence.takes.at(-1)!;
  return (
    <main className="learning-page">
      <nav className="learning-nav" aria-label="Learning">
        <a href="/" className="wordmark">
          scripty
        </a>
        <a href="/studio" className="quiet-link">
          Back to the set <Icon name="arrow" size={16} />
        </a>
      </nav>
      <h1>
        Fewer flags.
        <br />
        Still worth a closer look.
      </h1>
      <div className="comparison-pair">
        <figure>
          <img
            src={evidence.firstImage}
            alt="Mara in the baseline batch, a recorded continuity review"
          />
          <figcaption>
            Batch 1{" "}
            <span>
              {first.flagged}/{first.shots} flagged
            </span>
          </figcaption>
        </figure>
        <figure>
          <img
            src={evidence.latestImage}
            alt="Mara in the latest recorded batch four"
          />
          <figcaption>
            Latest · Batch {latest.index}{" "}
            <span>
              {latest.flagged}/{latest.shots} flagged
            </span>
          </figcaption>
        </figure>
      </div>
      <p className="comparison-note">Recorded results. Settings changed.</p>
      <p className="learning-rates">
        {evidence.takes
          .map((take) => `B${take.index} ${take.flagged}/${take.shots}`)
          .join(" → ")}{" "}
        · flagged shots
      </p>
      <div className="learning-bottom">
        <p className="learning-context">
          Different scenes, generator settings and added checks. Human review is
          pending; these flags do not establish visual improvement.
        </p>
        <a href="/studio?view=evidence" className="action primary">
          See the evidence <Icon name="arrow" size={16} />
        </a>
      </div>
      <p className="learning-memory">Correction → Memory → Next take.</p>
      <p className="learning-context">
        One ring rule reached {evidence.applications} later recorded prompts and
        checks.
      </p>
    </main>
  );
}
