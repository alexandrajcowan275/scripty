import { existsSync } from "node:fs";
import { resolve } from "node:path";
/** Match Next's local configuration without ever echoing credentials. Existing environment wins. */
export function loadLocalEnv(): void {
  const filename = resolve(process.cwd(), ".env.local");
  if (existsSync(filename)) {
    const previous = { ...process.env };
    process.loadEnvFile(filename);
    for (const [key, value] of Object.entries(previous)) if (value !== undefined) process.env[key] = value;
  }
}
