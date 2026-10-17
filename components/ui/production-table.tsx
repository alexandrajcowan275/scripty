"use client";
import { ShotImage } from "../shot-image";
import { MotionLink } from "./motion";
import { RecordedTime } from "./production-overview";
import {
  currentShot,
  shotsFor,
  sortedBatches,
  type ProductionData,
} from "../ui-v2/data";

type ProductionRow = {
  id: string;
  name: string;
  data?: ProductionData;
  createdAt?: string;
};
export function ProductionTable({
  rows,
  loading = false,
}: {
  rows: ProductionRow[];
  loading?: boolean;
}) {
  return (
    <div
      className="v2-productions-table-wrap"
      tabIndex={0}
      role="region"
      aria-label="Productions"
    >
      <table className="v2-productions-table">
        <thead>
          <tr>
            {["Production", "Take", "Shots", "Status", "Updated", ""].map(
              (label, i) => (
                <th scope="col" key={i}>
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, name, data, createdAt }) => {
            const latest = sortedBatches(data).at(-1),
              shots = shotsFor(data, latest?.id),
              pending = shots.filter(
                (s) =>
                  data &&
                  currentShot(s, data).flagged &&
                  s.status === "pending",
              ).length;
            const image =
              shots[0]?.imageUrl ??
              data?.project.characters[0]?.referenceImageUrl;
            const updated =
              data?.traces
                .map((t) => t.createdAt)
                .sort()
                .at(-1) ??
              latest?.createdAt ??
              createdAt;
            const href = `/p/${id}`;
            return (
              <tr key={id}>
                <td>
                  <MotionLink href={href} className="v2-production-table-name">
                    {image && (
                      <ShotImage src={image} alt="" variant="thumbnail" />
                    )}
                    <span>
                      <strong>{name}</strong>
                      <small>
                        {data
                          ? `${data.project.characters.length} ${data.project.characters.length === 1 ? "character" : "characters"} · ${data.rules.length} ${data.rules.length === 1 ? "rule" : "rules"} in memory`
                          : "—"}
                      </small>
                    </span>
                  </MotionLink>
                </td>
                <td>
                  <MotionLink href={href}>
                    {latest ? `Take ${latest.index}` : data ? "No takes" : "—"}
                  </MotionLink>
                </td>
                <td className="v2-mono">{data?.shots.length ?? "—"}</td>
                <td>
                  <MotionLink
                    href={href}
                    className={`v2-production-state ${pending ? "drift" : ""}`}
                  >
                    {data
                      ? pending
                        ? `${pending} to review`
                        : shots.length
                          ? "Ready"
                          : "New"
                      : "—"}
                  </MotionLink>
                </td>
                <td>
                  {updated ? <RecordedTime value={updated} compact /> : "—"}
                </td>
                <td>
                  <MotionLink href={href} aria-label={`Open ${name}`}>
                    ›
                  </MotionLink>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows.length && (
        <p className="v2-production-table-empty">
          {loading ? "Opening productions…" : "No productions found."}
        </p>
      )}
    </div>
  );
}
