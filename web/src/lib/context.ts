import { skillLog } from "./skill-logger";
import { readSkillFile } from "./skill-path";
import {
  filesForContext,
  primaryChapterHint,
  routeQuestion,
  type RouteDebug,
} from "./router";

const MAX_CHARS = 48_000;

export type ContextBuildResult = {
  context: string;
  sources: string[];
  routeDebug: RouteDebug;
  primaryChapterIds: string[];
  chapterHint: string;
  fileDetails: { file: string; chars: number; loaded: boolean; reason?: string }[];
  contextChars: number;
  truncated: boolean;
};

export function buildKnowledgeContext(
  question: string,
  requestId?: string,
): ContextBuildResult {
  const { primaryChapterIds, debug: routeDebug } = routeQuestion(question);
  const chapterHint = primaryChapterHint(primaryChapterIds, routeDebug);
  const plannedFiles = filesForContext();

  if (requestId) {
    skillLog(requestId, "route", "Contesto: skill completa", {
      mode: routeDebug.contextMode,
      filesPlanned: plannedFiles,
      primaryChapterIds,
      primaryTitles: primaryChapterIds.map(
        (id) => routeDebug.chapterTitles[id] ?? id,
      ),
      explicitChapter: routeDebug.explicitChapter,
      keywordHits: routeDebug.keywordHits,
      scores: routeDebug.scores,
      routingFallback: routeDebug.usedFallback,
    });
  }

  const parts: string[] = [];
  const sources: string[] = [];
  const fileDetails: ContextBuildResult["fileDetails"] = [];
  let total = 0;
  let truncated = false;

  if (chapterHint) {
    parts.push(`--- ROUTING ---\n${chapterHint}\n`);
    total += chapterHint.length + 24;
  }

  for (const file of plannedFiles) {
    const content = readSkillFile(file);
    const block = `--- FILE: ${file} ---\n${content}\n`;
    if (total + block.length > MAX_CHARS) {
      fileDetails.push({
        file,
        chars: content.length,
        loaded: false,
        reason: "limite contesto raggiunto",
      });
      truncated = true;
      if (requestId) {
        skillLog(requestId, "context", `File saltato (limite): ${file}`, {
          chars: content.length,
          totalChars: total,
          maxChars: MAX_CHARS,
        });
      }
      continue;
    }
    parts.push(block);
    sources.push(file);
    total += block.length;
    fileDetails.push({ file, chars: content.length, loaded: true });
    if (requestId) {
      skillLog(requestId, "context", `File caricato: ${file}`, {
        chars: content.length,
      });
    }
  }

  if (requestId) {
    skillLog(requestId, "context", "Contesto skill assemblato", {
      filesLoaded: sources.length,
      filesPlanned: plannedFiles.length,
      contextChars: total,
      approxTokens: Math.round(total / 4),
      truncated,
    });
  }

  return {
    context: parts.join("\n"),
    sources,
    routeDebug,
    primaryChapterIds,
    chapterHint,
    fileDetails,
    contextChars: total,
    truncated,
  };
}

/** Stesso set file della skill completa (foto senza testo). */
export function buildFullSkillContext(requestId?: string): Omit<
  ContextBuildResult,
  "routeDebug" | "primaryChapterIds" | "chapterHint"
> & {
  routeDebug: null;
  primaryChapterIds: [];
  chapterHint: "";
} {
  const plannedFiles = filesForContext();
  const parts: string[] = [];
  const sources: string[] = [];
  const fileDetails: ContextBuildResult["fileDetails"] = [];
  let total = 0;

  if (requestId) {
    skillLog(requestId, "route", "Solo foto: skill completa", {
      filesPlanned: plannedFiles,
    });
  }

  for (const file of plannedFiles) {
    const content = readSkillFile(file);
    const block = `--- FILE: ${file} ---\n${content}\n`;
    parts.push(block);
    sources.push(file);
    total += block.length;
    fileDetails.push({ file, chars: content.length, loaded: true });
    if (requestId) {
      skillLog(requestId, "context", `File caricato: ${file}`, {
        chars: content.length,
      });
    }
  }

  return {
    context: parts.join("\n"),
    sources,
    routeDebug: null,
    primaryChapterIds: [],
    chapterHint: "",
    fileDetails,
    contextChars: total,
    truncated: false,
  };
}
