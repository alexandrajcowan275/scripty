/** A detector's provisional side must never become part of a stable identifier
 * or label: creators can correct it without leaving a contradictory heading. */
export function neutralCanonSuggestions<T extends { key: string; label: string }>(attributes: T[]): T[] {
  const used = new Set<string>();
  return attributes.map(attribute => {
    const base = attribute.key.split("_").filter(part => !["left", "right"].includes(part)).join("_").slice(0, 80) || "detail";
    let key = base, suffix = 2;
    while (used.has(key)) key = `${base}_${suffix++}`;
    used.add(key);
    const label = attribute.label.replace(/\b(left|right)\b/gi, "").replace(/\s+/g, " ").trim() || "Canon detail";
    return { ...attribute, key, label };
  });
}
