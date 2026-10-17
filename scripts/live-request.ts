/** Explicit admin-authorized live access. Never print this header object. */
export function liveHeaders(): Record<string, string> {
  return { "content-type": "application/json", "x-canon-mode": "live", ...(process.env.CANON_ADMIN_TOKEN ? { "x-canon-admin-token": process.env.CANON_ADMIN_TOKEN } : {}) };
}
