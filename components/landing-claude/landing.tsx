"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import s from "./landing.module.css";

const STATEMENT = "Cinema is being generated. Continuity isn't.";

const CHECKS = [
  { k: "Red wool scarf", v: "✓ 0.99", ok: true },
  { k: "Short black hair", v: "✓ 0.98", ok: true },
  { k: "Silver ring · right hand", v: "✓", ok: true },
  { k: "Scar · LEFT eye", v: "✕ 0.83", ok: false },
];

const GRID = ["e0a363b5e81c", "32102f4cb12f", "c572629800c7", "08c322d07e20", "de2c61a4b138", "8a7badfdfd08"];

const STEPS = [
  { n: "01", t: "Check", d: "Every generated shot is compared with your character's canon, one detail at a time. Unclear stays unclear. It never guesses." },
  { n: "02", t: "Correct", d: "Reject a shot with one plain note. Scripty turns it into a single testable rule and merges it with what it already knows." },
  { n: "03", t: "Carry forward", d: "The rule rides into every future prompt and every future check, across any model you generate with." },
];


function clamp(v: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v));
}

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const f = () => setR(m.matches);
    m.addEventListener?.("change", f);
    return () => m.removeEventListener?.("change", f);
  }, []);
  return r;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={s.logo} aria-label="Scripty home">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="9" fill={light ? "#fff" : "#0E0F12"} />
        <path d="M8 12V8h4M20 8h4v4M24 20v4h-4M12 24H8v-4" fill="none" stroke={light ? "#0E0F12" : "#fff"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="3.2" fill="#E5484D" />
      </svg>
      <span>scripty</span>
    </Link>
  );
}

function Timecode() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      setT((performance.now() - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const p = (n: number) => String(Math.floor(n)).padStart(2, "0");
  const frames = Math.floor((t % 1) * 24);
  return (
    <span className={s.mono}>
      TC {p(t / 3600)}:{p((t / 60) % 60)}:{p(t % 60)}:{p(frames)}
    </span>
  );
}

export function LandingClaude() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    if (reduce) return;
    let seen = false;
    try { seen = sessionStorage.getItem("scripty-intro") === "1"; sessionStorage.setItem("scripty-intro", "1"); } catch {}
    if (seen) return;
    setIntro(true);
    document.documentElement.dataset.intro = "on";
    const done = () => { setIntro(false); delete document.documentElement.dataset.intro; };
    const id = window.setTimeout(done, 2600);
    window.addEventListener("wheel", done, { once: true });
    window.addEventListener("pointerdown", done, { once: true });
    return () => { window.clearTimeout(id); window.removeEventListener("wheel", done); window.removeEventListener("pointerdown", done); };
  }, [reduce]);
  const revealRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [reveal, setReveal] = useState(0);
  const [words, setWords] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const total = STATEMENT.split(" ").length;
    if (reduce) {
      setReveal(1);
      setWords(total);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        setScrolled(window.scrollY > 40);
        const r = revealRef.current?.getBoundingClientRect();
        if (r) setReveal(clamp(-r.top / (r.height - vh)));
        const st = statementRef.current?.getBoundingClientRect();
        if (st) setWords(Math.round(clamp((vh * 0.85 - st.top) / (vh * 0.55)) * total));
        const sp = stepsRef.current?.getBoundingClientRect();
        if (sp) setStep(Math.min(2, Math.floor(clamp(-sp.top / (sp.height - vh)) * 3)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce]);

  // reveal card geometry: grows from inset card to full-bleed over first 55% of the pinned scroll
  const grow = clamp(reveal / 0.55);
  const scale = 0.78 + 0.22 * grow;
  const radius = 28 * (1 - grow);
  const hud = clamp((reveal - 0.5) / 0.4);
  const locked = hud > 0.15;
  const rowsShown = Math.round(clamp((hud - 0.15) / 0.6) * CHECKS.length);
  const memory = hud > 0.85;

  return (
    <div className={s.page}>
      <header className={`${s.nav} ${scrolled ? s.navSolid : ""}`}>
        <Logo light />
        <nav className={s.navLinks} aria-label="Scripty">
          <a href="#how">Product</a>
          <Link href="/developers">API</Link>
          <Link href="/evidence">Evidence</Link>
          <Link href="/dashboard" className={s.navCta}>Open studio</Link>
        </nav>
      </header>

      {/* HERO with opening title sequence */}
      <section className={s.hero}>
        <picture className={s.heroBg} aria-hidden="true">
          <source media="(max-width: 760px)" srcSet="/brand/cinema-dunes-small.webp" />
          <img src="/brand/cinema-dunes.webp" alt="" />
        </picture>
        <div className={s.heroShade} />
        <div className={s.vignette} aria-hidden="true" />
        <div className={s.grain} aria-hidden="true" />
        <div className={s.track} aria-hidden="true">
          <i /><i /><i /><i />
          <em>SUBJECT LOCKED<br />CANON ✓</em>
        </div>
        <div className={s.heroTop}>
          <span className={s.rec}><i />REC</span>
          <span className={s.mono}>EXT. DUNES — DUSK</span>
          <Timecode />
        </div>
        <h1 className={s.h1}>Every shot,<span>held to the story.</span></h1>
        <div className={`${s.ctas} ${s.heroCtas}`}>
          <Link href="/dashboard" className={s.btnLight}>Open the studio</Link>
          <a href="#how" className={s.btnText}>Watch it work →</a>
        </div>
        <p className={`${s.mono} ${s.heroCap}`}>THE SCRIPT SUPERVISOR<br />FOR GENERATED FILM</p>
        {intro ? (
          <div className={s.intro} aria-hidden="true">
            <div className={`${s.lbar} ${s.lbarT}`} /><div className={`${s.lbar} ${s.lbarB}`} />
            <span className={s.introTitle}>SCRIPTY</span>
          </div>
        ) : null}
      </section>

      {/* THE FUTURE OF CINEMA: light + type only */}
      <section className={s.future}>
        <div className={s.beam} aria-hidden="true" /><div className={s.beam2} aria-hidden="true" /><div className={s.lamp} aria-hidden="true" />
        <p className={`${s.mono} ${s.futureK}`}>INT. THE FUTURE OF CINEMA</p>
        <h2 ref={statementRef} className={s.futureH}>
          {STATEMENT.split(" ").map((w, i) => (
            <span key={i} className={`${s.fw} ${i < words ? s.fwOn : ""} ${i >= 4 ? s.fwDim : ""}`}>{w}{i === 3 ? <br /> : " "}</span>
          ))}
        </h2>
      </section>

      {/* PROJECTED: the shot opens up out of the beam */}
      <section id="reveal" ref={revealRef} className={s.revealTrack}>
        <div className={s.revealSticky}>
          <div className={s.revealCaption} style={{ opacity: 1 - grow }}>
            <span className={s.mono}>SC 12 · TK 4 · S05</span>
          </div>
          <div className={s.revealCard} style={{ transform: `scale(${scale})`, borderRadius: radius }}>
            <img src="/landing/de2c61a4b138.jpg" alt="A generated shot of Mara opening a wooden locker, being checked by Scripty" />
            <div className={s.revealShade} style={{ opacity: hud }} />
            <div className={`${s.bk} ${locked ? s.bkLocked : ""}`} aria-hidden="true"><i /><i /><i /><i /></div>
            <div className={`${s.glass} ${s.callout} ${locked ? s.show : ""}`}>
              <b>Scar is by her right eye</b>
              <span className={s.mono}>canon: LEFT · confidence 0.83</span>
            </div>
            <div className={`${s.glass} ${s.panel} ${hud > 0.1 ? s.show : ""}`}>
              <div className={s.panelHead}><span className={s.mono}>T4 · S05 · CHECKING</span><span className={`${s.mono} ${s.bad}`}>{rowsShown >= 4 ? "DRIFT" : "…"}</span></div>
              {CHECKS.map((c, i) => (
                <div key={c.k} className={`${s.row} ${i < rowsShown ? s.rowOn : ""}`}>
                  <span>{c.k}</span><span className={`${s.mono} ${c.ok ? s.ok : s.bad}`}>{c.v}</span>
                </div>
              ))}
            </div>
            <div className={`${s.glass} ${s.memory} ${memory ? s.show : ""}`}>
              <i className={s.memDot} />
              <div><b>Scar is always over her LEFT eye.</b><span className={s.mono}>saved to memory</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (sticky) */}
      <section id="how" ref={stepsRef} className={s.stepsTrack}>
        <div className={s.stepsSticky}>
          <div className={s.stepsList}>
            <p className={`${s.mono} ${s.eyebrowDark}`}>How it works</p>
            {STEPS.map((st, i) => (
              <div key={st.n} className={`${s.step} ${i === step ? s.stepOn : ""}`}>
                <span className={s.mono}>{st.n}</span>
                <div><h3>{st.t}</h3><p>{st.d}</p></div>
              </div>
            ))}
          </div>
          <div className={s.stepsStage}>
            <div className={`${s.stage} ${step === 0 ? s.stageOn : ""}`}>
              <div className={s.grid}>
                {GRID.map((g, i) => (
                  <div key={g} className={`${s.cell} ${i === 4 ? s.cellFlag : ""}`}>
                    <img src={`/landing/${g}.jpg`} alt="" />
                    <span className={s.mono}>S0{i + 1}{i === 4 ? " · DRIFT" : " ✓"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${s.stage} ${step === 1 ? s.stageOn : ""}`}>
              <div className={s.noteCard}>
                <span className={`${s.mono} ${s.muted}`}>Your note on T4 · S05</span>
                <p className={s.note}>Her scar should be over her LEFT eye, even when she's turned away.</p>
                <div className={s.arrow}>↓</div>
                <div className={s.ruleCard}>
                  <i className={s.memDot} />
                  <div><b>Mara's scar is always over her LEFT eye.</b><span className={s.mono}>rule · merged with canon · not duplicated</span></div>
                </div>
              </div>
            </div>
            <div className={`${s.stage} ${step === 2 ? s.stageOn : ""}`}>
              <pre className={s.code}>
{`// next prompt, take 5
ACTIVE CANON CONSTRAINTS:
  Silver ring stays on her RIGHT hand.
`}<mark>{`+ Scar is always over her LEFT eye.`}</mark>{`

// next check
{ "key": "scar_side", "expected": "LEFT" }`}
              </pre>
              <p className={`${s.mono} ${s.muted}`}>One real correction reached 18 of 18 later prompts and checks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM */}
      <section className={s.platform}>
        <div className={s.platCopy}>
          <h2 className={s.h2}>One layer in front of<span> any generator.</span></h2>
          <div className={s.ctas}>
            <Link href="/developers" className={s.btnLight}>Read the API</Link>
            <Link href="/evidence" className={s.btnText}>View a trace →</Link>
          </div>
          <pre className={s.codeDark}>{`POST /api/batch
{ "projectId": "mara", "scenePrompts": ["night train"] }`}{"\n"}<span className={s.gd}>→ rules applied</span> · <span className={s.ok}>checked</span> · <span className={s.bad}>flagged</span> · traced</pre>
        </div>
        <div className={s.dia} aria-hidden="true">
          <div className={s.node} style={{ left: 0, top: 40 }}><span>INPUT</span>Scene prompt</div>
          <div className={s.node} style={{ left: 0, top: 270 }}><span>CANON</span>Character sheet</div>
          <div className={`${s.node} ${s.core}`} style={{ left: 240, top: 150, width: 220 }}><span>SCRIPTY</span>Rules → prompt<br />Monitor → checks<br />Memory → learns</div>
          <div className={s.node} style={{ left: 520, top: 60 }}><span>GENERATOR</span>Any image / video model</div>
          <div className={s.node} style={{ left: 520, top: 260 }}><span>OUTPUT</span>Shot + verdict</div>
          <div className={`${s.node} ${s.mem}`} style={{ left: 240, top: 440, width: 220 }}><span>MEMORY</span>Every correction</div>
          <i className={s.ln} style={{ left: 140, top: 68, width: 100, transform: "rotate(25deg)" }} />
          <i className={s.ln} style={{ left: 150, top: 298, width: 90, transform: "rotate(-30deg)" }} />
          <i className={s.ln} style={{ left: 460, top: 190, width: 64, transform: "rotate(-38deg)" }} />
          <i className={s.ln} style={{ left: 460, top: 240, width: 64, transform: "rotate(30deg)" }} />
          <i className={`${s.ln} ${s.lnGold}`} style={{ left: 350, top: 300, width: 140, transform: "rotate(90deg)" }} />
        </div>
      </section>

      {/* CLOSE: the dunes again, at night */}
      <section className={s.closeN}>
        <picture className={s.closeBg} aria-hidden="true">
          <source media="(max-width: 760px)" srcSet="/brand/cinema-dunes-small.webp" />
          <img src="/brand/cinema-dunes.webp" alt="" />
        </picture>
        <div className={s.heroShade} /><div className={s.vignette} aria-hidden="true" />
        <div className={`${s.track} ${s.trackGold}`} aria-hidden="true"><i /><i /><i /><i /><em>MEMORY SAVED<br />CARRIED FORWARD</em></div>
        <div className={s.closeInner}>
          <h2 className={s.closeH}>Every correction<span>carries forward.</span></h2>
          <div className={s.ctas}>
            <Link href="/dashboard" className={s.btnLight}>Open the studio</Link>
            <Link href="/new" className={s.btnGhost}>Start a production</Link>
          </div>
        </div>
        <footer className={s.footN}>
          <span>SCRIPTY · LOS ANGELES</span><span>FADE OUT.</span><a href="/brand/CREDITS.md">PHOTO CREDITS</a>
        </footer>
      </section>
    </div>
  );
}
