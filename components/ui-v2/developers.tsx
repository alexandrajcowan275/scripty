"use client";
import { AppPageHeader } from "../ui/app-shell";
import { useEffect, useState } from "react";
import { Ambient, MotionLink, RevealHeadline } from "../ui/motion";
import { ErrorNotice, Nav } from "../ui/chrome";
import { CodeBlock } from "../ui/code-block";
import { ContinuityReceipt } from "../ui/receipt";
import { useConfiguration } from "./config";
import { ProductionProvider, useProduction } from "./provider";
import { modelLabel, shotsFor, sortedBatches } from "./data";
function ApiContent() {
  const { data, error, refresh, loading } = useProduction(),
    { config } = useConfiguration();
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState("");
  const batch = sortedBatches(data).at(-1),
    shots = shotsFor(data, batch?.id),
    shot = shots.find((s) => s.flagged) ?? shots[0];
  const code = `SCRIPTY_URL="${origin || "YOUR_SCRIPTY_URL"}"

# Use your production ID and the access code from your operator.\n# Keep the owner cookies from production creation.\ncurl -X POST "$SCRIPTY_URL/api/batch" \\\n  -b scripty.cookies -c scripty.cookies \\\n  -H "Authorization: Bearer $SCRIPTY_ACCESS_CODE" \\\n  -H "Content-Type: application/json" \\\n  -d '{"projectId":"YOUR_PRODUCTION_ID",\n       "scenePrompts":["A portrait beside a train window."]}'\n\n# A correction returns the saved rule.\ncurl -X POST "$SCRIPTY_URL/api/shot/SHOT_ID_FROM_BATCH_RESPONSE/review" \\\n  -b scripty.cookies -c scripty.cookies \\\n  -H "Authorization: Bearer $SCRIPTY_ACCESS_CODE" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify({ projectId: "YOUR_PRODUCTION_ID", decision: "reject", reason: "Keep the scar over the LEFT eye." })}'`;
  return (
    <div className="v2-screen v2-developers">
      <Ambient />
      <AppPageHeader title="API" productionName={data?.project.name} />
      <main className="v2-detail-wrap v2-api-wrap">
        <p className="v2-muted">Same canon. Every prompt and check.</p>
        {error && (
          <ErrorNotice
            retry={() => {
              void refresh().catch(() => {});
            }}
          >
            {error}
          </ErrorNotice>
        )}
        <ol className="v2-pipeline" aria-label="Continuity pipeline">
          <li>
            <strong>Scene prompt</strong>
            <span>From your production</span>
          </li>
          <li className="memory">
            <strong>Memory</strong>
            <span>Canon + learned rules</span>
          </li>
          <li>
            <strong>Generate</strong>
            <span title={config?.imageModel}>
              {config?.imageModel ? modelLabel(config.imageModel) : "—"}
            </span>
          </li>
          <li className={shot?.flagged ? "v2-pipeline-drift" : ""}>
            <strong>Check</strong>
            <span title={config?.monitorModel}>
              {config?.monitorModel ? modelLabel(config.monitorModel) : "—"}
            </span>
          </li>
        </ol>
        <div className="v2-api-layout">
          <section className="v2-api-code">
            <div className="v2-rail-heading">
              <h2 className="v2-label">Generate a take · teach a rule</h2>
              <button
                className="v2-text-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(code);
                    setCopied(true);
                    setCopyError("");
                  } catch {
                    setCopyError(
                      "Copy isn’t available here. Select the example instead.",
                    );
                  }
                }}
              >
                {copied ? "Copied ✓" : "Copy curl"}
              </button>
            </div>
            <CodeBlock code={code} />
            <p className="v2-muted">
              Live generation uses your production. Mara stays a sample.
            </p>
            {copyError && <ErrorNotice>{copyError}</ErrorNotice>}
            <div className="v2-endpoints">
              {[
                {
                  method: "GET",
                  path: "/api/project/:id",
                  description: "Memory, takes, shots, trace",
                },
                {
                  method: "POST",
                  path: "/api/project/:id/recheck",
                  description: "Check existing images",
                },
                {
                  method: "POST",
                  path: "/api/project/:id/fix",
                  description: "Repair flagged shots",
                },
                {
                  method: "GET",
                  path: "/api/project/:id/labels",
                  description: "Blind questions",
                },
                {
                  method: "GET",
                  path: "/api/eval?projectId=:id",
                  description: "Read human-reviewed metrics",
                },
              ].map((endpoint) => (
                <div key={endpoint.path}>
                  <span
                    className={`v2-method v2-mono ${endpoint.method === "GET" ? "v2-method-get" : ""}`}
                  >
                    {endpoint.method}
                  </span>
                  <code>{endpoint.path}</code>
                  <span>{endpoint.description}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="v2-receipt-section">
            <h2 className="v2-label">A real check. A continuity receipt.</h2>
            {data && shot ? (
              <ContinuityReceipt data={data} shot={shot} />
            ) : loading ? (
              <div
                className="v2-skeleton v2-receipt-skeleton"
                aria-label="Loading continuity receipt"
              />
            ) : (
              <p className="v2-muted">
                {error ? "No receipt returned." : "No checks recorded yet."}
              </p>
            )}
            <MotionLink href="/p/mara" kind="mara" className="v2-text-button">
              See the shot in Studio →
            </MotionLink>
          </section>
        </div>
      </main>
    </div>
  );
}
export function DevelopersScreen() {
  return (
    <ProductionProvider id="mara">
      <ApiContent />
    </ProductionProvider>
  );
}
