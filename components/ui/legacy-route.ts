export type LegacyQuery = Record<string, string | string[] | undefined>;

/** Preserve production context without accepting a URL as a redirect target. */
export function legacyStudioTarget(query: LegacyQuery = {}) {
  const value = (key: string) =>
    typeof query[key] === "string" ? (query[key] as string) : undefined;
  const id = value("id") || "mara";
  const evidence = ["progress", "evidence"].includes(value("view") ?? "");
  const params = new URLSearchParams();
  for (const key of ["start", "take"]) {
    const entry = value(key);
    if (entry) params.set(key, entry);
  }
  const suffix = params.size ? `?${params.toString()}` : "";
  return `/p/${encodeURIComponent(id)}${evidence ? "/evidence" : ""}${suffix}`;
}
