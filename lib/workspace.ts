import { humanCalibrationNotes } from "./human-eval";
import { cachedProject } from "./engine-cache";
import { getProject, getShot, serverDatabase, type ProjectData } from "./db";
import { HttpError } from "./engine-http";
import { ownedProduction, productionCharacter, productionOwner } from "./productions";
import type { AttributeCheck, Shot } from "./types";
export type MonitorRun = { id: string; shot_id: string; checks: AttributeCheck[]; flagged: boolean; drift_score: number; rule_ids: string[]; model: string; version: string; created_at: string };
export async function workspace(request: Request, id: string) {
  const owner = productionOwner(request);
  const owned = id === "mara" ? null : await ownedProduction(request, id);
  const cached = id === "mara" ? await cachedProject(request, id, true) : null;
  const data = cached?.data ?? await getProject(id);
  if (!data || !data.project.characters[0]) throw new HttpError("Production not found", 404);
  if (owned) data.project.characters[0] = productionCharacter(data.project.characters[0], owned);
  const evidence = await workspaceEvidence(id, owner.hash);
  const latest = new Map<string, MonitorRun>();
  for (const run of evidence.monitorRuns) if (!latest.has(run.shot_id)) latest.set(run.shot_id, run);
  const repairShots = (await Promise.all(evidence.repairs.map(row => getShot(row.shot_id)))).filter((shot): shot is Shot => Boolean(shot));
  const allShots = [...data.shots, ...repairShots.filter(shot => !data.shots.some(original => original.id === shot.id))];
  const effectiveShots = allShots.map(shot => {
    const checked = latest.get(shot.id);
    return checked ? { ...shot, checks: checked.checks, flagged: checked.flagged, driftScore: checked.drift_score } : shot;
  });
  const checkerCalibration = await humanCalibrationNotes(id, owner.hash);
  return { ...data, ...evidence, checkerCalibration, shots: allShots, repairShots, effectiveShots, ownerHash: owner.hash, owned, cached };
}
export async function workspaceEvidence(projectId: string, ownerHash: string) {
  const db = serverDatabase();
  const [checks, repairs] = await Promise.all([
    db.from("monitor_runs").select("id,shot_id,checks,flagged,drift_score,rule_ids,model,version,created_at").eq("project_id", projectId).eq("owner_hash", ownerHash).order("created_at", { ascending: false }).limit(500),
    db.from("shot_repairs").select("shot_id,source_shot_id,created_at").eq("project_id", projectId).eq("owner_hash", ownerHash).order("created_at", { ascending: false }).limit(100),
  ]);
  if (checks.error || repairs.error) throw new Error("Could not load production check history");
  return { monitorRuns: checks.data as MonitorRun[], repairs: repairs.data ?? [] };
}
export function selectShots(shots: Shot[], ids?: string[], flaggedOnly = false): Shot[] {
  if (ids && (new Set(ids).size !== ids.length || ids.some(id => !shots.some(shot => shot.id === id)))) throw new HttpError("Choose shots from this production", 400);
  const selected = ids ? shots.filter(shot => ids.includes(shot.id)) : shots;
  if (flaggedOnly && selected.some(shot => !shot.flagged) && ids) throw new HttpError("Only flagged shots can be repaired", 409);
  return flaggedOnly ? selected.filter(shot => shot.flagged) : selected;
}
export function publicSnapshot(data: ProjectData) { return { project: data.project, rules: data.rules, batches: data.batches, shots: data.shots, traces: data.traces }; }
