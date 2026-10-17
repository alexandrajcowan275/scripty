"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { message, post, request, type ProductionData, type ReviewReceipt } from "./data";

type Context = { id: string; data: ProductionData | null; loading: boolean; error: string; busy: string | null; notes: Record<string, string>; setNote: (shotId: string, value: string) => void; receipt: ReviewReceipt | null; setReceipt: (receipt: ReviewReceipt | null) => void; refresh: () => Promise<ProductionData>; review: (shotId: string, decision: "accept" | "reject", reason?: string) => Promise<ReviewReceipt>; run: (action: "recheck" | "fix" | "generate", options?: Record<string, unknown>) => Promise<unknown> };
const ProductionContext = createContext<Context | null>(null);
export function ProductionProvider({ id, children }: { id: string; children: ReactNode }) {
  const [data, setData] = useState<ProductionData | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(""), [busy, setBusy] = useState<string | null>(null), [receipt, setReceipt] = useState<ReviewReceipt | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const setNote = useCallback((shotId: string, value: string) => setNotes(previous => ({ ...previous, [shotId]: value })), []);
  const initializedSample = useRef(false);
  const active = useRef(true), pending = useRef(false);
  const refresh = useCallback(async () => {
    if (id === "mara" && !initializedSample.current) { await request<ProductionData>("/api/productions/sample"); initializedSample.current = true; }
    const result = await request<ProductionData>(`/api/project/${encodeURIComponent(id)}`);
    if (!result.project || !Array.isArray(result.shots) || !Array.isArray(result.batches) || !Array.isArray(result.rules) || !Array.isArray(result.traces)) throw new Error("This production couldn’t be opened.");
    if (active.current) { setData(result); setError(""); }
    return result;
  }, [id]);
  useEffect(() => { active.current = true; refresh().catch(e => { if (active.current) setError(message(e)); }).finally(() => { if (active.current) setLoading(false); }); return () => { active.current = false; }; }, [refresh]);
  const review = useCallback(async (shotId: string, decision: "accept" | "reject", reason?: string) => {
    if (pending.current) throw new Error("That note is already being saved.");
    pending.current = true; setBusy("review"); setError("");
    try {
      const result = await post<ReviewReceipt>(`/api/shot/${encodeURIComponent(shotId)}/review`, { projectId: id, decision, ...(reason !== undefined ? { reason } : {}) });
      if (!result.shot) throw new Error("The review wasn’t returned. Reopen the shot before trying again.");
      if (active.current) { setReceipt(result); setData(previous => previous ? { ...previous, shots: previous.shots.map(s => s.id === result.shot.id ? result.shot : s), rules: result.newRule ? [...previous.rules.filter(r => r.id !== result.newRule!.id), result.newRule] : previous.rules } : previous); }
      return result;
    } finally { pending.current = false; if (active.current) setBusy(null); }
  }, [id]);
  const run = useCallback(async (action: "recheck" | "fix" | "generate", options: Record<string, unknown> = {}) => {
    if (pending.current) throw new Error("A take is already in progress.");
    pending.current = true; setBusy(action); setError("");
    const poll = action === "generate" || action === "fix" ? setInterval(() => { void refresh().catch(() => {}); }, 4000) : null;
    try {
      const result = await post(action === "generate" ? "/api/batch" : `/api/project/${encodeURIComponent(id)}/${action}`, { ...(action === "generate" ? { projectId: id } : {}), ...options });
      await refresh(); return result;
    } finally { if (poll) clearInterval(poll); pending.current = false; if (active.current) setBusy(null); }
  }, [id, refresh]);
  const value = useMemo(() => ({ id, data, loading, error, busy, receipt, setReceipt, notes, setNote, refresh, review, run }), [id, data, loading, error, busy, receipt, notes, setNote, refresh, review, run]);
  return <ProductionContext.Provider value={value}>{children}</ProductionContext.Provider>;
}
export function useProduction() { const context = useContext(ProductionContext); if (!context) throw new Error("ProductionProvider missing"); return context; }
