import fs from "fs";
import os from "os";
import path from "path";

const SKILL_SLUG = "agenti-intelligenti-altair";

export function resolveSkillDir(): string {
  const candidates = [
    process.env.SKILL_DIR,
    path.join(process.cwd(), "knowledge", SKILL_SLUG),
    path.join(process.cwd(), "..", "knowledge", SKILL_SLUG),
    path.join(os.homedir(), ".cursor", "skills", SKILL_SLUG),
  ].filter((p): p is string => Boolean(p));

  for (const dir of candidates) {
    const skillMd = path.join(dir, "SKILL.md");
    if (fs.existsSync(skillMd)) return dir;
  }

  throw new Error(
    `Skill non trovata. Imposta SKILL_DIR o copia la skill in web/knowledge/${SKILL_SLUG}/`,
  );
}

export function readSkillFile(relativePath: string): string {
  const full = path.join(resolveSkillDir(), relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`File skill mancante: ${relativePath}`);
  }
  return fs.readFileSync(full, "utf-8");
}
