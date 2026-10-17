import type { Metadata } from "next";
import { FrameInspector } from "@/components/public-site/v4/frames";
import {
  frames,
  ringRule,
  ruleKey,
  carriedFrames,
  matchedFlags,
} from "@/components/public-site/v4/data";
export const metadata: Metadata = { title: "Scripty — All 24 frames" };
export default function Page() {
  return (
    <FrameInspector
      frames={frames}
      rule={ringRule}
      ruleKey={ruleKey}
      reach={carriedFrames.length}
      ab={matchedFlags}
    />
  );
}
