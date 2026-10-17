"use client";
import type { CSSProperties } from "react";
import type { Rule, Shot } from "@/lib/types";
import { ShotImage } from "../shot-image";
import { allShots, rulePromptReach, type ProductionData } from "../ui-v2/data";
export function RuleCard({ rule, data, land }: { rule: Rule; data: ProductionData; land?: boolean }) {
  const learned = rule.source !== "seed", prompts = rulePromptReach(rule, allShots(data)), checks = new Set([...allShots(data).filter(s => s.checks.some(c => c.key === `rule:${rule.id}`)).map(s => s.id), ...(data.monitorRuns ?? []).filter(r => r.checks.some(c => c.key === `rule:${rule.id}`)).map(r => r.shot_id)]).size;
  return <div className={`v2-rule ${learned ? "gold" : ""} ${land ? "land" : ""}`} style={{ viewTransitionName: `memory-${rule.id.replace(/[^\w-]/g, "-")}` } as CSSProperties}><i className="v2-rule-dot" /><div>{rule.text}<p className="v2-mono">{learned ? `learned · in ${prompts} prompts · ${checks} checks` : `canon · checked ${checks}×`}</p></div></div>;
}

export function LearnedRuleCard({ rule, shot, merged }: { rule: Rule; shot: Shot; merged: boolean }) { return <div className="v2-learned-card" style={{ viewTransitionName: `memory-${rule.id.replace(/[^\w-]/g, "-")}` } as CSSProperties}><ShotImage src={shot.imageUrl} alt={shot.scenePrompt} /><div><h3>{rule.text}</h3><p className="v2-mono">{rule.id} · {merged ? "merged, not duplicated" : "new continuity rule"}</p></div></div>; }
