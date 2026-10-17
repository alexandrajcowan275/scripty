/** Public information pages stay outside the working production shell. */
export function isStudioRoute(path: string): boolean {
  const pathname = path.split(/[?#]/, 1)[0];
  return /^\/(dashboard|projects|productions|new|p)(\/|$)/.test(pathname);
}

export const publicNavigation = [
  { label: "Product", href: "/#how" },
  { label: "API", href: "/developers" },
  { label: "Evidence", href: "/evidence" },
  { label: "Open studio", href: "/dashboard" },
] as const;
