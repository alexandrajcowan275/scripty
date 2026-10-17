# Canon database

Apply `migrations/20261017023831_canon_schema.sql` to the Supabase project, then seed with `npx tsx scripts/seed.ts`. The script loads `.env.local` without printing credentials. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. All public tables have RLS enabled and anonymous/authenticated privileges revoked. The Next.js server is the sole database client. Public reads from Storage bucket `shots` are intentional; there are no anonymous upload policies.

For an isolated local disposable demo only, a developer could disable RLS with `ALTER TABLE public.<table> DISABLE ROW LEVEL SECURITY` (for each table), and grant the local role table access. This is unnecessary with the server service-role setup. Never disable RLS or grant anonymous writes in the deployed project.

The migration uses text identifiers to preserve the shared `mara` project ID. Foreign keys prevent cross-project batch/shot/trace links. Rule usage increments are atomic. Check/shot writes use one transaction via the `save_shot` RPC added by the data adapter migration.

Validation after applying: inspect table RLS flags and anonymous privileges, check that `shots` bucket is public, then run the seed and fetch project `mara`. Live SQL checks are required in the configured project; this source worktree has no database credentials.
