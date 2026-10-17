# Ten-shot visual label worksheet — DRAFT, agent-reviewed

**No human verification has occurred. These are candidate visual judgments, not ground truth or reportable evaluation results.** All boolean entries in `seed/labels.json` remain `status: "draft"`; no `verifiedBy` or `verifiedAt` is populated. Default eval therefore scores zero labels. Five uncertain/occluded cells have no fabricated boolean.

## Fixed criteria and review method

Compared each complete local PNG directly with `public/seed/mara-reference.png`: red wool-like knitted scarf; scar over anatomical LEFT eye; short black hair; silver ring on anatomical RIGHT hand. Near-frontal image-right corresponds to anatomical left. In turned poses, follow eyes, shoulders, arms, and hands rather than swapping left/right from image position alone. A hidden feature is unknown, not automatically a failure. Extra jewelry alone does not negate a visibly correct right-hand silver ring.

Image filenames agree with the scene order in each folder's `shots.json`: baseline platform/window/fire escape/map/door/table; new scenes bridge/library/steps/ticket. IDs were taken from those mapping records; judgments below were based on the PNGs and fixed reference, not monitor pass/fail values. Original image URLs and SHA256 hashes are preserved in `shotCoverage` so human review can use the exact evidence. The supplied mapping files contain monitor outputs, so this is not a formally blinded human study; no monitor result was used as a label.

**Coverage:** ten distinct real shot IDs; 40 criterion cells; 35 draft booleans and five uncertain/occluded cells. These counts describe the worksheet only. They do not establish precision, recall, error rate, or improvement. Baseline has six shots, new-scene subset four; the unequal small samples and visibility exclusions must be disclosed.

Legend: **P** = candidate visible pass; **F** = candidate visible contradiction; **U** = uncertain/occluded, excluded from boolean labels. Every cell still needs a human decision.

| Batch / scene | Real shot ID | Red scarf | Left-eye scar | Short black hair | Right-hand silver ring |
| --- | --- | --- | --- | --- | --- |
| 1 / 1 | `d6c58089-cd77-4b2e-b01c-79e3791b59ed` | P | U | P | U |
| 1 / 2 | `9986ea9e-1d8f-4afc-a45a-a6631923d8cb` | P | P | P | U |
| 1 / 3 | `0653bd35-2fe3-490f-a36a-7a98356b4d98` | P | P | P | P |
| 1 / 4 | `1fc48122-2b25-4841-b588-5554298bd339` | P | P | P | F |
| 1 / 5 | `61f3f0b9-ffd9-4060-b7f4-510ed895eedc` | P | U | P | U |
| 1 / 6 | `d0c0499f-306d-4fdf-bea0-958436f144bf` | P | P | P | P |
| 2 / 1 | `2d371fa9-6ff8-4cf3-9973-070373b72cb7` | P | P | P | P |
| 2 / 2 | `46dac550-1c1f-46e0-83e5-0ba03088bc83` | P | P | P | P |
| 2 / 3 | `ad21a387-b490-4093-838b-5f9e2cda2101` | P | P | P | P |
| 2 / 4 | `218a5fed-c03a-498a-bd75-cc441540f964` | P | P | P | P |

## Per-image observations

### Batch 1, scene 1: Wide establishing shot of Mara crossing a foggy railway platform at dawn.

Shot: `d6c58089-cd77-4b2e-b01c-79e3791b59ed`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/d8558165-3695-4a00-ac38-55f72f62ff45-d6c58089-cd77-4b2e-b01c-79e3791b59ed.png). Local review source: `/private/tmp/canon-inspection/01/shot-1.png`.

- **scarf_color: P — draft truePass=true.** Red knitted scarf is visibly wrapped around the neck and draped over the coat.
- **scar_side: U — no boolean label.** UNCERTAIN: the face occupies a small area of this wide shot; a definite left-eye scar cannot be resolved confidently at the inspected scale. Do not score absence as drift.
- **hair: P — draft truePass=true.** Visible dark/black bob ends at the jaw, consistent with the short black reference haircut.
- **ring_hand: U — no boolean label.** UNCERTAIN: hands are small in the wide frame and metallic details are too small to confidently establish a silver band and its anatomical hand.

### Batch 1, scene 2: Close-up portrait of Mara looking toward camera in soft window light.

Shot: `9986ea9e-1d8f-4afc-a45a-a6631923d8cb`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/70c895a8-94a9-437f-8be6-bfd954f03d33-9986ea9e-1d8f-4afc-a45a-a6631923d8cb.png). Local review source: `/private/tmp/canon-inspection/01/shot-2.png`.

- **scarf_color: P — draft truePass=true.** Close-up clearly shows a red textured knitted scarf.
- **scar_side: P — draft truePass=true.** Scar marks are around the eye on image-right in this near-frontal face: anatomical LEFT, matching the reference.
- **hair: P — draft truePass=true.** Short black bob with fringe is clearly visible.
- **ring_hand: U — no boolean label.** UNCERTAIN: a silver ring is clearly present on the raised hand near the scarf, but the tightly framed/crossed wrist pose does not establish anatomical hand laterality confidently.

### Batch 1, scene 3: Low-angle shot of Mara climbing a fire escape at golden hour.

Shot: `0653bd35-2fe3-490f-a36a-7a98356b4d98`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/f4e67491-6089-4cdb-92eb-08db2744a646-0653bd35-2fe3-490f-a36a-7a98356b4d98.png). Local review source: `/private/tmp/canon-inspection/01/shot-3.png`.

- **scarf_color: P — draft truePass=true.** Red thick knitted scarf is clearly visible despite warm sunset illumination.
- **scar_side: P — draft truePass=true.** Face is near-frontal and scar marks encircle the image-right eye: anatomical LEFT.
- **hair: P — draft truePass=true.** Short black/dark bob is visible; warm rim lighting does not change the base hair color.
- **ring_hand: P — draft truePass=true.** A silver-colored band is visible on the raised image-left hand; its arm can be traced to the near-frontal character's anatomical RIGHT shoulder. A separate warm/gold-colored band on the other hand is not evidence that the required right-hand silver ring is absent.

### Batch 1, scene 4: Profile medium shot of Mara reading a map under a cool streetlamp at night.

Shot: `1fc48122-2b25-4841-b588-5554298bd339`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/f80e1e8b-a3b5-4241-b14e-ac1bfba36dd9-1fc48122-2b25-4841-b588-5554298bd339.png). Local review source: `/private/tmp/canon-inspection/01/shot-4.png`.

- **scarf_color: P — draft truePass=true.** The scarf is visibly red, thick, and knitted.
- **scar_side: P — draft truePass=true.** The face is near-frontal, angled downward; scar marks are on image-right, anatomical LEFT.
- **hair: P — draft truePass=true.** Black jaw-length bob with fringe remains visible.
- **ring_hand: F — draft truePass=false.** The silver band is clearly on the image-right hand holding the map: anatomical LEFT in this near-frontal pose. The corresponding fingers of the image-left/anatomical RIGHT hand are visible holding the other map edge without a silver band.

### Batch 1, scene 5: Over-the-shoulder shot of Mara opening a door in a warmly lit room.

Shot: `61f3f0b9-ffd9-4060-b7f4-510ed895eedc`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/98f1adc6-80ac-40e9-94db-6c41fea1851a-61f3f0b9-ffd9-4060-b7f4-510ed895eedc.png). Local review source: `/private/tmp/canon-inspection/01/shot-5.png`.

- **scarf_color: P — draft truePass=true.** Red textured knitted scarf is visible across the back of the neck and shoulder.
- **scar_side: U — no boolean label.** OCCLUDED/UNCERTAIN: rear three-quarter viewpoint exposes only a narrow facial profile; the required left-eye area is not sufficiently visible to confirm or refute placement.
- **hair: P — draft truePass=true.** Rear view clearly shows a short black bob at the neck.
- **ring_hand: U — no boolean label.** OCCLUDED/UNCERTAIN: one silver-ringed hand is visible at the door, but the other hand/right-hand requirement cannot be fully inspected from this rear pose. Do not infer failure solely from the visible hand or absence of the hidden hand.

### Batch 1, scene 6: High-angle shot of Mara reaching across a table in bright midday light.

Shot: `d0c0499f-306d-4fdf-bea0-958436f144bf`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/6deb7757-b479-42e7-85f1-d2e0c7b365f8-d0c0499f-306d-4fdf-bea0-958436f144bf.png). Local review source: `/private/tmp/canon-inspection/01/shot-6.png`.

- **scarf_color: P — draft truePass=true.** Red knitted scarf is clearly visible around the neck and chest.
- **scar_side: P — draft truePass=true.** Near-frontal high-angle face shows scar marks at the image-right eye, anatomical LEFT.
- **hair: P — draft truePass=true.** Short black bob with fringe matches the fixed character criterion.
- **ring_hand: P — draft truePass=true.** A silver band is visible on the reaching image-left hand; its sleeve traces to the character's anatomical RIGHT side in this near-frontal view.

### Batch 2, scene 1: Wide establishing shot of Mara walking across a misty pedestrian bridge at dawn.

Shot: `2d371fa9-6ff8-4cf3-9973-070373b72cb7`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/63881597-73fa-418c-8eaf-5013d4a98cc4-2d371fa9-6ff8-4cf3-9973-070373b72cb7.png). Local review source: `/private/tmp/canon-inspection/02/shot-1.png`.

- **scarf_color: P — draft truePass=true.** A red knitted scarf is visible at the neck and down the chest.
- **scar_side: P — draft truePass=true.** Near-frontal face shows scar marks around image-right/anatomical LEFT eye.
- **hair: P — draft truePass=true.** Short black bob and fringe are visible.
- **ring_hand: P — draft truePass=true.** Silver band is visible on the image-left hand gripping the bag strap; the arm traces directly to anatomical RIGHT shoulder. The other hand is pocketed and is not needed to confirm the visible right-hand ring.

### Batch 2, scene 2: Close-up portrait of Mara seated beside a library window in soft daylight.

Shot: `46dac550-1c1f-46e0-83e5-0ba03088bc83`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/4e70bbd2-d6e6-484c-9dc5-5b513fe085ff-46dac550-1c1f-46e0-83e5-0ba03088bc83.png). Local review source: `/private/tmp/canon-inspection/02/shot-2.png`.

- **scarf_color: P — draft truePass=true.** Red wool-like knitted scarf clearly surrounds the neck.
- **scar_side: P — draft truePass=true.** The scar is on image-right side of the near-frontal face: anatomical LEFT eye.
- **hair: P — draft truePass=true.** Short black bob with fringe is clearly visible.
- **ring_hand: P — draft truePass=true.** Silver band is visible on the lower/image-left hand resting on the open book. The sleeve can be followed to the character's anatomical RIGHT shoulder; the opposite arm supports her head.

### Batch 2, scene 3: Low-angle shot of Mara ascending worn stone steps at golden hour.

Shot: `ad21a387-b490-4093-838b-5f9e2cda2101`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/7d3f2451-6280-4a06-bfb0-391318e29239-ad21a387-b490-4093-838b-5f9e2cda2101.png). Local review source: `/private/tmp/canon-inspection/02/shot-3.png`.

- **scarf_color: P — draft truePass=true.** Red knitted scarf is visible despite warm edge light.
- **scar_side: P — draft truePass=true.** Scar marks surround image-right/anatomical LEFT eye in the near-frontal face.
- **hair: P — draft truePass=true.** The visible haircut is a short black bob.
- **ring_hand: P — draft truePass=true.** Silver band is visible on image-left hand gripping the shoulder strap; the arm belongs to the anatomical RIGHT side in this near-frontal pose.

### Batch 2, scene 4: Profile medium shot of Mara buying a ticket under a cool station light at night.

Shot: `218a5fed-c03a-498a-bd75-cc441540f964`. [Exact image](https://ybaxkdxaihhwyuyykjra.supabase.co/storage/v1/object/public/shots/2026-10-17/68ff122b-e88e-4296-ad64-8b54d0b7d08b-218a5fed-c03a-498a-bd75-cc441540f964.png). Local review source: `/private/tmp/canon-inspection/02/shot-4.png`.

- **scarf_color: P — draft truePass=true.** Red chunky knitted scarf is clearly visible around the neck.
- **scar_side: P — draft truePass=true.** Although the prompt calls for profile, the rendered face is three-quarter with both eyes distinguishable. Scar marks lie beside the farther/image-right eye, anatomical LEFT; the near/image-left eye is the right eye.
- **hair: P — draft truePass=true.** Short black bob and fringe remain clearly visible.
- **ring_hand: P — draft truePass=true.** A silver band is visible on the extended hand taking the ticket. The visible sleeve/forearm can be followed back to the near anatomical RIGHT shoulder in the three-quarter pose; this judgment uses arm continuity, not screen position alone.

## Human completion steps

1. Open the exact image and reference; independently review all four fixed criteria for each shot. Recheck the map shot's visible left-hand ring/right-hand fingers and every uncertain laterality cell rather than accepting the draft automatically.
2. Correct any candidate boolean you disagree with. Keep uncertain/occluded features out of boolean labels. Human reviewers may add a label only if they can actually determine the criterion from the image.
3. For individually confirmed labels only, set `status` to `verified`, add your real `verifiedBy` identity and the actual `verifiedAt` review time. Do not bulk promote these entries on the agent's behalf.
4. Run default evaluation and report the number of human-verified criterion labels, distinct shots, visibility exclusions, fixed criteria, and monitor version. Use `--include-drafts` only for explicitly labeled exploratory diagnostics; never describe it as human-labeled accuracy.
5. For improvement claims, compare new scenes under the same fixed criteria and checker version; disclose that learned-rule checks alter operational flagged rates. This worksheet alone proves no improvement.

## What works / limits / next steps

All ten supplied images and the reference were inspected locally. No external image/vision API, generation call, cache update, or paid model call was made. Only `seed/labels.json` and this worksheet were changed. Draft entries remain excluded by the existing evaluation guard. Root/human next step: review the exact images, resolve the five U cells if possible, verify individual labels, then run evaluation. No metric was fabricated.
