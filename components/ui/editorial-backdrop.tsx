/** Licensed decorative photography stays outside the shot/evidence image layer. */
export function EditorialBackdrop({ kind }: { kind: "visor" | "couture" }) {
  return (
    <div
      aria-hidden="true"
      className={`v2-editorial-backdrop v2-editorial-${kind}`}
    />
  );
}
