import Link from "next/link";
import { ShotImage } from "@/components/shot-image";
import { V4Site } from "./shell";
import { ScrollStory } from "./story";
import {
  rejected,
  ringRule,
  laterFrames,
  carriedFrames,
  matchedFlags,
} from "./data";
function Caption({
  label,
  children,
  first = false,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div className="cap">
      <div className="k">{label}</div>
      {first ? <h1>{children}</h1> : <h2>{children}</h2>}
    </div>
  );
}
export function EvidenceStory() {
  const finding = rejected.checks.find((check) => check.key === "ring_hand")!;
  return (
    <V4Site active="Evidence">
      <ScrollStory count={5}>
        <section className="beat on">
          <div className="e-shot">
            <ShotImage
              src={rejected.imageUrl}
              alt={rejected.scenePrompt}
              priority
            />
            <span className="red-tag">
              RING · WRONG HAND · {finding.confidence.toFixed(2)}
            </span>
          </div>
          <Caption first label="Evidence · Mara · Take 1 · Shot 2">
            A generated shot.
            <br />
            <span>The ring is on the wrong hand.</span>
          </Caption>
          <div className="hint">SCROLL</div>
        </section>
        <section className="beat">
          <div className="e-shot dimmed">
            <ShotImage src={rejected.imageUrl} alt={rejected.scenePrompt} />
          </div>
          <div className="note-slip">
            <div>YOUR NOTE · REJECTED</div>
            <p>“Keep the single silver ring on her anatomical RIGHT hand.”</p>
          </div>
          <Caption label="Step 1">You wrote one note.</Caption>
        </section>
        <section className="beat">
          <div className="rule-card">
            <div>◆ SAVED TO MARA’S MEMORY</div>
            <p>{ringRule}</p>
          </div>
          <Caption label="Step 2">Scripty kept it as a rule.</Caption>
        </section>
        <section className="beat">
          <div className="later">
            <div className="reach">
              <b data-reach-count>0</b>
              <span>OF {laterFrames.length} LATER PROMPTS AND CHECKS</span>
            </div>
            <div className="later-grid">
              {laterFrames.map((frame) => (
                <div key={frame.id} data-later-frame>
                  <ShotImage
                    src={frame.imageUrl}
                    alt={`Take ${frame.take}, Shot ${frame.number}: ${frame.scenePrompt}`}
                    variant="thumbnail"
                  />
                  <i aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
          <Caption label="Step 3 · Takes 2–4">
            Then it followed every take.
          </Caption>
        </section>
        <section className="beat">
          <div className="honest">
            <div>
              <b>
                {carriedFrames.length}/{laterFrames.length}
              </b>
              <p>
                Later prompts and checks that carried the rule.
                <br />
                Proven.
              </p>
            </div>
            <div>
              <b>
                {matchedFlags[0]} vs {matchedFlags[1]}
              </b>
              <p>
                Flags with and without memory in a matched A/B test. No extra
                visual improvement shown yet.
              </p>
            </div>
          </div>
          <Caption label="The honest read">
            Memory that persists.
            <br />
            <span>Proof of fewer mistakes is next.</span>
          </Caption>
          <div className="more">
            <Link className="w" href="/evidence/frames">
              Inspect all 24 frames
            </Link>
            <Link href="/dashboard">Open the studio</Link>
          </div>
        </section>
      </ScrollStory>
    </V4Site>
  );
}
