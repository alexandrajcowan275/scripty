import { Fragment } from "react";

/** Preserve the copyable source exactly; highlighting adds presentation only. */
export function CodeBlock({ code }: { code: string }) {
  const parts = code.split(/(#[^\n]*|"[^"\n]*"|'[^']*')/g);
  return (
    <pre className="v2-code" tabIndex={0} aria-label="API request examples">
      <code>
        {parts.map((part, index) => {
          const kind = part.startsWith("#")
            ? "comment"
            : /^["']/.test(part)
              ? "string"
              : "";
          return kind ? (
            <span className={`v2-code-${kind}`} key={index}>
              {part}
            </span>
          ) : (
            <Fragment key={index}>{part}</Fragment>
          );
        })}
      </code>
    </pre>
  );
}
