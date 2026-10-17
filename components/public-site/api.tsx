import Link from "next/link";
import { PublicSite } from "./shell";
import styles from "./public-site.module.css";

const requestExample = `POST /api/shot/SHOT_ID/review
Content-Type: application/json
Authorization: Bearer $SCRIPTY_ACCESS_CODE

{
  "projectId": "YOUR_PRODUCTION_ID",
  "decision": "reject",
  "reason": "Keep the silver ring on Mara's RIGHT hand."
}`;
const responseExample = `{
  "newRule": {
    "text": "Mara always wears a silver ring on her RIGHT hand.",
    "attributeKey": "ring_hand",
    "source": "rejection"
  },
  "merged": false
}`;
const endpoints = [
  ["GET", "/api/project/:id", "Production, rules, shots and traces"],
  ["POST", "/api/batch", "Generate and check a new take"],
  ["POST", "/api/shot/:id/review", "Accept or reject with a correction"],
  ["POST", "/api/project/:id/recheck", "Monitor existing shots; no new images"],
  ["POST", "/api/project/:id/fix", "Regenerate selected flagged shots"],
  ["POST", "/api/eval", "Metrics from saved human labels"],
];
export function PublicApiPage() {
  return <PublicSite active="API">
    <section className={styles.intro}><h1>API</h1><p>Bring production memory into your generation pipeline. Review a shot, save a correction, and carry its rule into future prompts and checks.</p><div className={styles.links}><a className={styles.textLink} href="https://github.com/alexandrajcowan275/scripty/blob/main/docs/api.md" target="_blank" rel="noreferrer">Full API reference ↗</a><Link href="/evidence">View the evidence →</Link></div></section>
    <section className={styles.section}><h2>A correction becomes a rule.</h2><p>Live extraction requires authorized access and the production’s ownership cookie. The examples below illustrate the contract; they do not send requests.</p><h3 className={styles.label} style={{margin:"22px 0 12px"}}>Request example</h3><pre className={styles.code}><code>{requestExample}</code></pre><h3 className={styles.label} style={{margin:"22px 0 12px"}}>Abridged response example</h3><pre className={styles.code}><code>{responseExample}</code></pre></section>
    <section className={styles.section}><h2>Endpoints</h2><table className={styles.endpoints}><thead><tr><th>Method</th><th>Route</th><th>Purpose</th></tr></thead><tbody>{endpoints.map(([method,path,purpose])=><tr key={path}><td>{method}</td><td><code>{path}</code></td><td>{purpose}</td></tr>)}</tbody></table></section>
    <section className={styles.section}><h2>Access and ownership</h2><p>Authorize through POST /api/access using your operator-provided access code. Keep the browser’s production ownership cookie when calling private routes. Generation, repair and fresh model checks are rate- and budget-limited; evaluation of saved human labels makes no AI calls.</p><div className={styles.links}><Link className={styles.button} href="/dashboard">Open studio</Link><Link href="/p/mara">Explore sample production: Mara →</Link></div></section>
  </PublicSite>;
}
