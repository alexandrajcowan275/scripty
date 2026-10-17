"use client";

import { Brand } from "./chrome";
import { Ambient, MotionLink, RevealHeadline } from "./motion";

export function RecoveryScreen({ missing = false }: { missing?: boolean }) {
  return (
    <div className="v2-screen v2-recovery">
      <Ambient />
      <header className="v2-top">
        <Brand />
      </header>
      <main className="v2-recovery-content">
        <RevealHeadline
          lead={missing ? "This scene isn’t here." : "The set needs a moment."}
          continuation={
            missing
              ? "Let’s get you back on set."
              : "Your production is still yours."
          }
        />
        <MotionLink href="/projects" className="v2-button v2-primary">
          Your productions →
        </MotionLink>
      </main>
    </div>
  );
}
