import { Icon } from "@/components/icons";
import { archiveEvidence } from "@/components/demo-evidence";
import cache from "@/seed/cache/manifest.json";
export default function Home() {
  const evidence = archiveEvidence(cache.batches);
  return (
    <div className="landing">
      <div className="landing-grain" aria-hidden="true" />
      <header className="landing-nav">
        <a className="wordmark" href="/" aria-label="Scripty home">
          scripty
        </a>
        <nav aria-label="Main">
          <a href="#how-it-works">How it works</a>
          <a href="/studio" className="quiet-link">
            Open demo <Icon name="arrow" size={15} />
          </a>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="overline">FOR THE NEXT TAKE</span>
            <h1>
              Your AI script
              <br />
              supervisor.
            </h1>
            <p>Every correction carries forward.</p>
            <a className="action primary hero-action" href="/studio">
              Open demo project <Icon name="arrow" size={18} />
            </a>
            <div className="hero-production-note">
              <span className="memory-dot" />
              <span>Noted. On the next take.</span>
            </div>
          </div>
          <figure className="hero-frame">
            <img
              src={evidence.heroImage}
              alt="Mara in a red scarf, waiting beside a cafe window"
              fetchPriority="high"
            />
            <figcaption>
              <span className="film-label">MARA / FRAME 02</span>
              <span className="recorded-chip">Recorded check</span>
            </figcaption>
          </figure>
        </section>
        <section id="how-it-works" className="landing-story">
          <div className="story-heading">
            <span className="overline">SAME CHARACTER. NEXT TAKE.</span>
            <h2>
              The little details
              <br />
              make the story.
            </h2>
            <a className="quiet-link" href="/learning">
              See the evidence <Icon name="arrow" size={16} />
            </a>
          </div>
          <div className="story-beats">
            <article>
              <span className="film-label">01 / REVIEW</span>
              <h3>Drift caught.</h3>
              <p>See the detail that slipped.</p>
              <img
                src={evidence.firstImage}
                alt="A recorded continuity finding on Mara's ring hand"
                loading="lazy"
              />
            </article>
            <article className="memory-beat">
              <span className="film-label">02 / REMEMBER</span>
              <h3>Correction noted.</h3>
              <p>Your production notes, kept.</p>
              <blockquote>{evidence.learnedRule}</blockquote>
              <span className="story-reach">
                Applied in {evidence.applications} later recorded shots.
              </span>
            </article>
            <article>
              <span className="film-label">03 / NEXT TAKE</span>
              <h3>On the next take.</h3>
              <p>The next prompt remembers.</p>
              <img
                src={evidence.latestImage}
                alt="Mara in a different recorded scene with the learned rule applied"
                loading="lazy"
              />
            </article>
          </div>
        </section>
        <section className="landing-close">
          <p>
            One less thing
            <br />
            to keep in your head.
          </p>
          <a href="/studio" className="action primary">
            Meet your Scripty <Icon name="arrow" size={18} />
          </a>
        </section>
      </main>
      <footer className="landing-footer">
        <span>Scripty. Keep the story straight.</span>
        <a href="/studio?view=evidence">Recorded demo · evidence inside</a>
      </footer>
    </div>
  );
}
