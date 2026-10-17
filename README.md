# Scripty

```sh
cd ~/canon && npm run dev
```

Open **http://localhost:3000**. Public app: [Scripty](https://canon-woad.vercel.app/). Current release and verification: [morning handoff](handoff/MORNING.md).

**Your AI script supervisor. Every correction carries forward.**

On a film set, the scripty keeps continuity between shots. Scripty brings that production memory to AI filmmaking: review a shot, save a correction, and carry the rule into future generation and monitoring.

## Two ways in

**Start a new production.** Name the production and character, upload a private reference image or explicitly request reference creation, add canon details, and choose six scene prompts. Production data, checks, corrections and memory belong to that production in Supabase. Access is tied to a signed, HttpOnly browser cookie; accounts and cross-device recovery are outside this release.

**Explore a sample production: Mara.** The complete history opens immediately: four takes,24 genuine images, original prompts, monitor checks and rule traces. Sample reviews are saved for this browser. They do not rewrite existing images or establish a new engine run.

Public paid generation is disabled during the founder's overnight no-spending window. A generation request preserves the production and offers Mara. The implementation also has persistent creation/generation limits and a global atomic$24 API reservation cap. No purchase or extra generation is needed to explore the sample.

## Run and check

Node24.x and npm are required. Dependencies and local credentials are already installed on the founder's Mac. On a new checkout:

```sh
npm ci
cp .env.example .env.local
# Supply server credentials privately; never commit .env.local.
npm run dev
```

```sh
npm test
npm run build
npm start
```

Supabase migrations are in `supabase/migrations/`. Tables have RLS enabled and no browser write access. Character references use a private Storage bucket and an ownership-checked server endpoint. Service credentials never enter the client bundle. The sample's own images are bundled locally and require no AI or database request.

## What learning means here

A rejection becomes one short, testable rule. Repeated constraints merge. Generation receives the character canon and active rules; the monitor checks those rules too. Accepted shots can become positive visual references. These are persistent production memory and prompt adaptation; model weights stay fixed.

The sample's ring rule appears in all18 later generation prompts and corresponding monitor outputs. Correction reach requires both the exact rule text in the prompt and the same rule ID in checks; it counts unique shot IDs.

| Take | Flagged shots | Uncertain checks |
| --- | --- | --- |
| 1, final v3 recheck | 2/6 | 4/36 |
| 2 | 0/6 | 6/42 |
| 3 | 0/6 | 8/42 |
| 4, latest | 1/6 | 6/42 |

**Visual improvement remains unverified.** Generator settings, scenes and references changed, and learned rules also changed monitoring. The final flag rate rose. Earlier baseline checker versions flagged6/6 before disclosed calibration. Human-verified accuracy is unavailable; draft labels are excluded from authoritative evaluation. See [results](handoff/results.md).

## Operator notes

- `CANON_PUBLIC_GENERATION_ENABLED=false` is the default overnight. Do not enable paid calls or raise limits without the founder's permission.
- `DEMO_MODE=cached` keeps the original internal sample adapter. This implementation identifier is retained for compatibility.
- Private operator requests to the original engine require its existing server-only admin token. Never put that token in browser code or URLs.
- `npm run eval` excludes unverified labels by default. Do not publish draft-only accuracy.
- `npm run cache:demo -- --capture-existing --batches 4 --base-url http://127.0.0.1:3017` is a read-only export of existing evidence; it does not generate new images.
- Repo/folder and Vercel project remain `canon`; the product is **Scripty**. The GitHub repository remains private as requested.

## Submission material

[Devpost copy](docs/devpost.md) · [video script](docs/video-script.md) · [brand guide](docs/brand-guide.md) · [design decisions](DECISIONS.md) · [limits and skipped work](BLOCKED.md).
