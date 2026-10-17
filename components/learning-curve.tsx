import type { Batch } from "@/lib/types";
import { Icon } from "./icons";

const percent = (value: number) => `${Math.round(value * 100)}%`;
export function LearningCurve({ batches }: { batches: Batch[] }) {
  const ordered = [...batches].sort((a, b) => a.index - b.index);
  const valid = ordered.filter((batch) => Number.isFinite(batch.driftRate));
  const latest = valid.at(-1);
  const first = valid[0];
  const delta = latest && first ? Math.round((first.driftRate - latest.driftRate) * 100) : 0;
  const points = valid.map((batch, i) => ({ batch, x: valid.length === 1 ? 220 : 38 + (i / (valid.length - 1)) * 410, y: 20 + (1 - Math.max(0, Math.min(1, batch.driftRate))) * 84 }));
  const line = points.map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  return <section className="learning-panel" aria-labelledby="learning-title">
    <div className="section-heading"><div className="heading-with-icon"><Icon name="activity"/><h2 id="learning-title">Learning curve</h2></div><span className="eyebrow">DRIFT / BATCH</span></div>
    <div className="learning-layout"><div className="learning-metric"><strong>{latest ? percent(latest.driftRate) : "—"}</strong><span>latest drift rate</span><p className={delta > 0 ? "pass-text" : "muted-text"}>{valid.length < 2 ? "Generate another batch to compare" : delta > 0 ? `↓ ${delta} percentage points since batch ${first.index}` : delta < 0 ? `↑ ${Math.abs(delta)} percentage points since batch ${first.index}` : "No change between first and latest batch"}</p></div>
      {points.length ? <div className="curve-wrap"><svg viewBox="0 0 470 134" className="curve" role="img" aria-label={`Drift rate by batch. ${valid.map((b) => `Batch ${b.index}: ${percent(b.driftRate)}`).join(". ")}`}>
        {[0, 0.5, 1].map((value) => <g key={value}><line x1="38" x2="448" y1={20 + (1-value)*84} y2={20 + (1-value)*84} className="chart-grid"/><text x="0" y={24 + (1-value)*84} className="chart-label">{percent(value)}</text></g>)}
        <path d={line} className="chart-line"/>{points.map(({ batch, x, y }) => <g key={batch.id}><circle cx={x} cy={y} r="4" className="chart-dot"><title>Batch {batch.index}: {percent(batch.driftRate)} flagged</title></circle><text x={x} y="126" textAnchor="middle" className="chart-label">B{String(batch.index).padStart(2, "0")}</text></g>)}
      </svg></div> : <div className="chart-empty">Your first batch starts the curve.</div>}
    </div><p className="chart-caption">Flagged shots ÷ total shots. Every point comes from a returned batch.</p>
  </section>;
}
