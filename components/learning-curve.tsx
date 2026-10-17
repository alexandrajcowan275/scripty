import type { Batch, Shot } from "@/lib/types";
import { batchEvidence } from "./batch-evidence";
import { Icon } from "./icons";

const percent = (value: number) => `${Math.round(value * 100)}%`;
export function LearningCurve({ batches, shots }: { batches: Batch[]; shots: Shot[] }) {
  const ordered = [...batches].sort((a, b) => a.index - b.index);
  const measured = ordered.map((batch) => ({ batch, evidence: batchEvidence(shots.filter((shot) => shot.batchId === batch.id)) }));
  const valid = measured.filter(({ batch, evidence }) => evidence.complete && Number.isFinite(batch.driftRate));
  const latest = measured.at(-1);
  const latestComplete = latest?.evidence.complete && Number.isFinite(latest.batch.driftRate);
  const excluded = measured.length - valid.length;
  const points = valid.map(({ batch }) => ({ batch, x: ordered.length === 1 ? 220 : 38 + (ordered.findIndex((item) => item.id === batch.id) / (ordered.length - 1)) * 410, y: 20 + (1 - Math.max(0, Math.min(1, batch.driftRate))) * 84 }));
  const line = points.map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  return <section className="learning-panel" aria-labelledby="learning-title">
    <div className="section-heading"><div className="heading-with-icon"><Icon name="activity"/><h2 id="learning-title">Learning curve</h2></div><span className="eyebrow">MONITOR FLAGS / BATCH</span></div>
    <div className="learning-layout"><div className="learning-metric"><strong>{latestComplete && latest ? percent(latest.batch.driftRate) : "—"}</strong><span>{latest && !latestComplete ? "Incomplete evidence" : "latest monitor flag rate"}</span><p className="muted-text">{latest ? `${latest.evidence.shotCount}/6 shots · ${latest.evidence.uncertainChecks} uncertain checks${excluded ? ` · ${excluded} incomplete excluded` : ""}` : "A completed batch starts the curve"}</p></div>
      {points.length ? <div className="curve-wrap"><svg viewBox="0 0 470 134" className="curve" role="img" aria-label={`Operational monitor flag rate for batches with complete evidence. ${valid.map(({ batch, evidence }) => `Batch ${batch.index}: ${percent(batch.driftRate)}, ${evidence.uncertainChecks} uncertain checks`).join(". ")}${excluded ? `. ${excluded} incomplete batches excluded.` : ""}`}>
        {[0, 0.5, 1].map((value) => <g key={value}><line x1="38" x2="448" y1={20 + (1-value)*84} y2={20 + (1-value)*84} className="chart-grid"/><text x="0" y={24 + (1-value)*84} className="chart-label">{percent(value)}</text></g>)}
        <path d={line} className="chart-line"/>{points.map(({ batch, x, y }) => <g key={batch.id}><circle cx={x} cy={y} r="4" className="chart-dot"><title>{`Batch ${batch.index}: ${percent(batch.driftRate)} operational flags`}</title></circle><text x={x} y="126" textAnchor="middle" className="chart-label">B{String(batch.index).padStart(2, "0")}</text></g>)}
      </svg></div> : <div className="chart-empty">{latest ? "Incomplete evidence. No completed measurements to plot." : "Your first completed batch starts the curve."}</div>}
    </div><p className="chart-caption">Operational monitor flags ÷ shots. Learned rules change the monitor; this does not verify improvement. Human-reviewed labels under fixed criteria are needed.</p>
  </section>;
}
