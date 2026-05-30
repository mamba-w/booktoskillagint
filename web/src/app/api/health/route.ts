import { resolveSkillDir } from "@/lib/skill-path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const skillDir = resolveSkillDir();
    return NextResponse.json({ ok: true, skillDir });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Skill non disponibile";
    return NextResponse.json({ ok: false, error: msg }, { status: 503 });
  }
}
