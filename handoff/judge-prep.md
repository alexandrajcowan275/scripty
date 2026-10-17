# Scripty — final judge preparation

Finalized October 17, 2026, 06:17 AM Pacific. Public demo: https://canon-woad.vercel.app/p/mara.

**Lead with:** “A correction becomes persistent production memory, used in later generation prompts and checks. Our controlled test found no additional reduction in flags; we show that result openly.”

This is a rehearsal panel, not actual judges’ words or votes. Questions and preferences below are informed guesses. All earlier panel UI/copy findings are resolved; no new blocking issue was observed in the bounded final check. Shared browser remained live-authorized, so this panel made no rejection/save, model calls, human labels, cookie changes or application edits. Full-path observations and Main’s separate live verification are distinguished in judge-log.md. Final check reloaded public Evidence and confirmed18reach plus the matched0/6vs0/6disclosure.

## Know whom you are addressing

[Official event](https://sephacks-2026.devpost.com/) lists Kaushal Patel/OpenAI, Michelle Liu/Studio Michelle Liu, Jerry Zhang/Lemma and ShiaoFong Yin/Lloyd Greif. The event lists Functionality, Continual Learning and Pitch; Design is an extra rehearsal dimension here. Specific track-to-judge assignments are the founder’s requested lens.

- **Kaushal Patel:** his [public announcement](https://www.linkedin.com/posts/kaushal21_im-excited-to-begin-a-new-chapter-as-a-member-activity-7454907783713329152-indc) supports OpenAI technical staff after Meta/Google. We did not verify “led ChatGPT” or a specific evals remit; do not introduce him with those claims.
- **Michelle Liu:** [portfolio](https://www.liumichelle.com/) lists Apple, Roblox, NASA JPL and clients Cognition, Luma, Pika; Film Diary, Polaroid Studio and Screentime Receipt are visible projects. [About](https://www.liumichelle.com/about) describes creative tools and tactile utility. The craft lens is evidence-informed; her reaction to Scripty is inferred.
- **ShiaoFong Yin:** [USC profile](https://www.marshall.usc.edu/people/shiaofong-yin) supports entrepreneurship faculty and TEALE managing-partner/investor background. Outcast is an event sponsor; her employment there is not verified.
- **Jerry Zhang:** [YC](https://www.ycombinator.com/companies/uselemma) identifies Lemma founder/CEO; his [company introduction](https://www.uselemma.ai/blog/introducing-lemma) explains semantic silent failures. Actionability is a reasonable inferred lens.

## Three hard questions per judge — practice these answers

### Kaushal Patel — rigorous learning/evaluation lens (inferred)

**1. What learns? Is this just prompt concatenation?**
It is application-level learning: an actual creator correction is extracted into one inspectable rule, deduplicated and persisted. Later generation and monitoring consume it. The original ring rule reached18later prompts and18corresponding checks across different scenes. Foundation-model weights stay fixed. That proves memory carry-forward, not improved model quality.

**2. What happened in the controlled A/B?**
Six paired scenes, six images per arm. Canon-only A had0/6targeted flagged shots; canon-plus-memory B also had0/6. Each arm had0/12ring/scar failures and0/24overall failed checks, with0unclear checks. No additional measured reduction. The baseline was already at the checker’s floor; human blind validation remains pending. We did not reroll unfavorable outcomes.

**3. How did you prevent a changing checker from manufacturing an improvement?**
Both arms used the same reference hash, image model/quality/size, fixed four-attribute canon-only checker, version and0.6threshold, with no accepted reference or calibration context. A omitted learned rules; B added the historical ring rule. Pair order alternated. Generation has no fixed seed, so this remains a small stochastic comparison. The older2/6→0/6→0/6→1/6series changed settings and is explicitly not causal evidence.

**Video emphasis:** show a specific saved rule reaching a later prompt/check, then state the matched0/6vs0/6result without turning it into an efficacy claim.

### Michelle Liu — creative-tool craft lens (inferred)

**1. What is the one strong product idea?**
The AI script supervisor. Creators inspect a continuity concern, make a production decision, and retain it as memory for future shots. Contact sheet→reference comparison→one note→Memory is the main story; Evidence and Eval are available when the creator wants proof.

**2. Why should this feel like a production tool instead of another AI dashboard?**
Real shots dominate. The take timeline, frame IDs, reference comparison, loupe, keyboard review and short note reflect the task of inspecting visual continuity. Glass labels, restrained haze, gold memory cues and Funnel/Martian typography follow the supplied Claude design. They help the correction land visibly; they are not a substitute for useful behavior. Motion/mobile parity was not exhaustively re-certified by this panel; existing Design/QA evidence is separate.

**3. How do I know the golden memory state is real?**
Show the actual returned rule text and whether it merged. A new note has0reach until it is applied. The historical ring rule has18prompt/check applications. In a free sample session, the new correction is a literal browser-local creator note; only authorized live mode invokes extraction. Neither rewrites the recorded images. Do not act out the visitor’s correction as causing historical shots.

**Video emphasis:** one uninterrupted, well-framed image→reference→relevant note→actual Memory transition; use an independent clean recording session so QA notes do not distract.

### ShiaoFong Yin — buyer/economics lens (inferred)

**1. Who pays and what are they buying?**
Our first buyer hypothesis is an AI production team repeatedly generating the same characters for ads or episodic stories. They would pay to retain production decisions and reduce repeated review/re-roll work. Seats plus checked-generation usage is a proposed model; we have no validated price, paying customer or measured savings to claim.

**2. Why can’t a generator or existing observability vendor copy this?**
They can copy parts. Our proposed distinction is creator-approved continuity memory connected to visual review, future prompts, checks and source-linked repair history across a production. Portability and accumulated reviewed outcomes may support retention, but neither a moat nor cross-customer data advantage has been demonstrated. Customer-owned references and permission boundaries matter.

**3. Is there a credible billion-dollar business and what are the unit economics?**
We have not established a billion-dollar outcome or TAM. The next test is a creator pilot measuring reviewer minutes and total generation/checking spend per human-approved shot, plus willingness to pay. The controlled12-image/12-monitor experiment cost an estimated$0.710364from returned usage; that is an experiment receipt, not full customer cost or an invoice. We must include failed calls, storage, review labor and retention before making a business claim.

**Video emphasis:** identify the recurring-character buyer and repeated workflow cost; close on a concrete pilot metric rather than a speculative market-size number.

### Jerry Zhang — silent-failure/actionability lens (inferred)

**1. What silent failure do you catch?**
A generation request can return successfully while the visible character violates canon, such as apparent ring-hand or scar-side drift. Scripty exposes expected/observed checks, model-reported confidence, uncertainty and traces. Left/right interpretation can itself be wrong, so present the concern as a monitor finding until a human verifies it.

**2. What happens after an alert?**
The creator’s correction becomes a persisted rule used in later prompts and checks. The backend can recheck an existing image with zero new image requests, or generate a replacement only for a flagged source while preserving originals and lineage. These functional paths were live-verified separately by Main. One tested replacement remained flagged; successful request completion did not mean the defect was fixed.

**3. How do you evaluate the monitor and stop it learning the wrong thing?**
Blind questions hide model verdict/condition until a real person judges. Frozen predictions prevent later rechecks from rewriting prior evaluation. Unclear labels stay separate; agent drafts never count. The12study images are first, covering48canon questions before the original162,210total. Human accuracy is still unverified; the UI keeps headline metrics blank until sufficient actual judgments, and undefined denominators can remain blank. Scoped calibration feedback is prompt context, not authoritative truth or weight training.

**Video emphasis:** alert→reviewable evidence→retained constraint→real next action, with uncertainty and an honest failed-repair example available in reserve.

## Final inferred scorecard

| Judge | Functionality | Continual Learning | Pitch | Design |
|---|---:|---:|---:|---:|
| Kaushal Patel | 8 | 6 | 8 | 8 |
| Michelle Liu | 8 | 6 | 8 | 9 |
| ShiaoFong Yin | 8 | 6 | 7 | 8 |
| Jerry Zhang | 8 | 7 | 8 | 8 |

Design is the strongest visible dimension. Learning effectiveness remains the limiting evidence: rule propagation and an honest test are real; extra visual improvement is not demonstrated. Jerry’s higher learning score reflects the functioning feedback-to-action loop, not a claim of better accuracy. Pitch scores assess written copy/product story; no final uploaded video was reviewed. No claim is made that these are the actual panel’s scores.

## Five remaining highest-impact readiness fixes

There are no outstanding panel-requested app-code fixes. These are submission and proof priorities, not five invented bugs.

1. **Resolve the deadline conservatively and submit on time.** Current official Devpost listing observed11amPDT; founder target2pmPT conflicts. Use11amunless the organizer confirms an extension. No extension or external submission is verified by this panel.
2. **Record and upload the two-minute video.** Follow MORNING’s Take1/T1S02route in an independent clean recording session. Keep live extraction versus free literal-note mode accurate; preserve the existing shared owner session. Make the video link accessible without login.
3. **Make the private GitHub repo accessible to judges.** Verify the required reviewers can open README/ARCHITECTURE and source. No repository visibility change or invitation was made by this panel.
4. **Supply actual blind judgments and confirm the exact demo finding.** Inspect the study images/reference, save a real judgment and refresh to confirm persistence. Do not label an ambiguous side as truth. If labels are incomplete, keep accuracy blank and say so; do not rush/fabricate labels for a metric.
5. **Rehearse the proof and value claim once.** Keep new-note0reach separate from historical18/18; preserve flat0/6vs0/6 and the remaining flagged repair; give one clear buyer/pilot metric. Avoid optional paid generation, disabled compare/cast/account claims and detours during the two minutes. No new feature, paid repetition or capacity expansion is needed to deliver this sample demo.

## Evidence to keep open for questions

- docs/results.md and seed/experiments/ab-test/result.json: controlled protocol/12images/24settled receipts; summary source hash was independently checked.
- docs/verification-live.json and docs/verification-ui-live-loop.json: Main’s functional API/UI proof; the latter recorded1later prompt/1check application,0/1flags in both takes, estimated$0.121538—not causal improvement.
- handoff/results.md: original24shots/four takes, uncertainty, calibration and historical18/18transfer.
- README/ARCHITECTURE: current capabilities, honest limits, private ownership and cost controls.
- judge-log.md: dated observations, inferred trend and resolved recommendations.

No new paid calls, image generations, human labels, model training, app edits or deployment changes were performed by this judge panel. The existing review automation is paused at completion, not deleted.
