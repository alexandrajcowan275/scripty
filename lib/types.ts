export type Attribute = { key: string; label: string; expected: string; weight: number }; // e.g. key:"scarf_color", expected:"red"
export type Character = { id: string; name: string; referenceImageUrl: string; attributes: Attribute[] };
export type Project = { id: string; name: string; characters: Character[] };
export type Rule = { id: string; projectId: string; text: string; attributeKey?: string; source: "rejection" | "correction" | "seed"; createdAt: string; timesApplied: number };
export type AttributeCheck = { key: string; expected: string; observed: string; pass: boolean; confidence: number; note?: string };
export type Shot = { id: string; projectId: string; batchId: string; scenePrompt: string; finalPrompt: string; imageUrl: string;
  checks: AttributeCheck[]; driftScore: number; flagged: boolean; status: "pending" | "accepted" | "rejected"; rejectReason?: string };
export type Batch = { id: string; projectId: string; index: number; rulesApplied: string[]; driftRate: number; createdAt: string };
export type TraceEvent = { id: string; projectId: string; shotId?: string; type: "generate" | "check" | "flag" | "rule_learned" | "rule_applied" | "error";
  category?: "attribute_drift" | "identity_drift" | "style_drift" | "prompt_ignored" | "api_error"; message: string; createdAt: string };
