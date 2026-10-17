import type { Metadata } from "next";
import Link from "next/link";
import recorded from "@/seed/cache/manifest.json";
import matched from "@/seed/experiments/ab-test/summary.json";
import { ShotImage } from "@/components/shot-image";
import { PublicSite } from "@/components/public-site/shell";
import styles from "@/components/public-site/public-site.module.css";

export const metadata: Metadata = { title: "Scripty — Evidence" };
const shots = recorded.batches.flatMap(({ shots }) => shots);
const ringCheck = shots.flatMap(({ checks }) => checks).find(({ key }) => key === "rule:ca721c45-1e5d-412c-83ba-9a566443c44b");
const rule = ringCheck?.expected ?? "Mara always wears a silver ring on her RIGHT hand.";
const reach = shots.filter(shot => shot.finalPrompt.includes(rule) && shot.checks.some(check => check.key === ringCheck?.key)).length;

export default function PublicEvidencePage() {
  return <PublicSite active="Evidence">
    <section className={styles.intro}><h1>Evidence</h1><p>Follow a creator correction into later generation prompts and checks. Mara’s original four-take history stays available to inspect.</p><div className={styles.links}><Link className={styles.button} href="/p/mara">Explore sample production: Mara →</Link><a className={styles.textLink} href="#method">Read the methodology ↓</a></div></section>
    <section className={styles.section}><h2>A correction, carried forward.</h2><blockquote className={styles.rule}>“{rule}”</blockquote><p>The original ring correction appears in {reach} later prompts and their recorded checks. This demonstrates persistent production memory and prompt adaptation, with fixed model weights.</p></section>
    <div className={styles.facts}><div className={styles.fact}><span className={styles.label}>Rule reach</span><strong>{reach} / 18</strong><p>Later prompts and checks carrying the ring rule.</p></div><div className={styles.fact}><span className={styles.label}>Original study</span><strong>{shots.length} shots</strong><p>Four takes, six distinct scenes per take.</p></div><div className={styles.fact}><span className={styles.label}>Matched A/B flags</span><strong>{matched.summary.A.flaggedShots}/{matched.summary.A.shots} vs {matched.summary.B.flaggedShots}/{matched.summary.B.shots}</strong><p>No additional reduction measured in this matched study.</p></div></div>
    <section className={styles.section}><h2>The original takes</h2><p>Different scenes, with their original monitor flags. These are model findings, not human-verified error rates or a controlled before-and-after comparison.</p>{recorded.batches.map(({batch,shots:takeShots})=><section className={styles.take} key={batch.id}><div className={styles.takeHeader}><h3>Take {batch.index}</h3><span className={styles.label}>{takeShots.filter(shot=>shot.flagged).length} / {takeShots.length} monitor flags</span></div><div className={styles.filmstrip}>{takeShots.map((shot,index)=><figure key={shot.id}><Link href={`/p/mara/shot/${shot.id}`} aria-label={`Inspect Take ${batch.index}, Shot ${index+1} in Studio`}><ShotImage src={shot.imageUrl} alt={shot.scenePrompt} variant="thumbnail" /></Link><figcaption>T{batch.index} · S{String(index+1).padStart(2,"0")}</figcaption></figure>)}</div></section>)}</section>
    <section className={styles.section} id="method"><h2>What the results establish</h2><p>Rule transfer is recorded in actual prompts and checks. Scenes, checker settings and reference choices changed across the original takes, so their flag rates do not establish causal improvement. The separate matched A/B experiment recorded zero targeted flags in both six-shot arms. Visual improvement and drift-detection accuracy require further human validation.</p><div className={styles.links}><a className={styles.textLink} href="https://github.com/alexandrajcowan275/scripty/tree/main/seed/experiments/ab-test" target="_blank" rel="noreferrer">Experiment records ↗</a><Link href="/p/mara/evidence">Inspect Mara’s production evidence →</Link></div></section>
  </PublicSite>;
}
