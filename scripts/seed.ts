import { readFile } from "node:fs/promises";
import { z } from "zod";
import { seedProject, getProject, projectSchema, ruleSchema } from "../lib/db";
import { loadLocalEnv } from "./env";

async function main() {
  loadLocalEnv();
  const seed = z.object({ project: projectSchema, rules: z.array(ruleSchema) }).parse(JSON.parse(await readFile(new URL("../seed/mara.json", import.meta.url), "utf8")));
  await seedProject(seed.project, seed.rules);
  const saved = await getProject(seed.project.id);
  if (!saved || saved.project.characters.length !== seed.project.characters.length) throw new Error("Seed verification failed: character sheet was not saved.");
  console.log(`Seeded and verified project ${saved.project.id}: ${saved.project.characters.length} character(s), ${saved.rules.length} rule(s). Existing reviews and batches preserved.`);
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Seed failed."); process.exitCode = 1; });
