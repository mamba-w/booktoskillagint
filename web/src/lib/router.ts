export type ChapterRef = {
  id: string;
  file: string;
  title: string;
};

export const CHAPTERS: ChapterRef[] = [
  { id: "ch01", file: "chapters/ch01-introduzione.md", title: "Introduzione" },
  { id: "ch02", file: "chapters/ch02-logica-per-agenti.md", title: "Logica per Agenti" },
  {
    id: "ch03",
    file: "chapters/ch03-agenti-razionali-architetture.md",
    title: "Agenti Razionali e Architetture",
  },
  { id: "ch04", file: "chapters/ch04-sistemi-multiagente.md", title: "Sistemi Multiagente" },
  { id: "ch05", file: "chapters/ch05-jade-jason.md", title: "JADE e JASON" },
  { id: "ch06", file: "chapters/ch06-teoria-dei-giochi.md", title: "Teoria dei Giochi" },
];

/** File di riferimento sempre utili. */
export const REFERENCE_FILES = [
  "glossary.md",
  "cheatsheet.md",
  "patterns.md",
] as const;

/** Ordine di caricamento: skill completa (entra nel limite ~48k char). */
export const FULL_SKILL_FILES: string[] = [
  "SKILL.md",
  ...REFERENCE_FILES,
  ...CHAPTERS.map((c) => c.file),
];

export type RouteDebug = {
  explicitChapter: string | null;
  keywordHits: { keyword: string; chapters: string[] }[];
  scores: Record<string, number>;
  usedFallback: boolean;
  chapterTitles: Record<string, string>;
  primaryChapterIds: string[];
  contextMode: "full-skill";
};

type RouteRule = { keywords: string[]; chapters: string[] };

const RULES: RouteRule[] = [
  {
    keywords: [
      "nash",
      "pareto",
      "prigioniero",
      "prisoner",
      "tit-for-tat",
      "tft",
      "axelrod",
      "asta",
      "vickrey",
      "mechanism",
      "giochi",
      "equilibrio",
      "dominante",
      "abm",
      "modelling",
    ],
    chapters: ["ch06"],
  },
  {
    keywords: [
      "jade",
      "jason",
      "agentspeak",
      "behaviour",
      "behavior",
      "fipa platform",
      "aid",
      "yellow pages",
    ],
    chapters: ["ch05"],
  },
  {
    keywords: [
      "kqml",
      "fipa acl",
      "acl",
      "speech act",
      "contract net",
      "bspl",
      "commitment",
      "performative",
      "illocuzione",
      "coordinazione",
      "cooperazione",
      "negoziazione",
      "mas",
      "multiagente",
      "multi-agente",
    ],
    chapters: ["ch04"],
  },
  {
    keywords: [
      "bdi",
      "intenzion",
      "practical reasoning",
      "prs",
      "brooks",
      "subsumption",
      "ibrid",
      "proattiv",
      "reattiv",
      "commitment strateg",
      "deliber",
      "pianific",
    ],
    chapters: ["ch03"],
  },
  {
    keywords: [
      "kripke",
      "modale",
      "epistem",
      "ltl",
      "ctl",
      "model checking",
      "assioma",
      "conoscenza",
      "belief",
      "frame problem",
      "fluenti",
    ],
    chapters: ["ch02"],
  },
  {
    keywords: [
      "turing",
      "wooldridge",
      "meyer",
      "introduz",
      "trend",
      "delega",
      "autonom",
    ],
    chapters: ["ch01"],
  },
];

const CHAPTER_TITLES = Object.fromEntries(CHAPTERS.map((c) => [c.id, c.title]));

export function routeQuestion(question: string): {
  primaryChapterIds: string[];
  debug: RouteDebug;
} {
  const q = question.toLowerCase();
  const chapterScores = new Map<string, number>();
  const keywordHits: RouteDebug["keywordHits"] = [];

  const explicit = q.match(/\bch\s*0?([1-6])\b/);
  const explicitChapter = explicit ? `ch0${explicit[1]}` : null;
  if (explicitChapter) {
    chapterScores.set(explicitChapter, 10);
  }

  for (const rule of RULES) {
    const matched = rule.keywords.filter((kw) => q.includes(kw));
    const hits = matched.length;
    if (hits === 0) continue;
    matched.forEach((keyword) =>
      keywordHits.push({ keyword, chapters: rule.chapters }),
    );
    for (const ch of rule.chapters) {
      chapterScores.set(ch, (chapterScores.get(ch) ?? 0) + hits);
    }
  }

  let primaryChapterIds = [...chapterScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  let usedFallback = false;
  if (primaryChapterIds.length === 0) {
    primaryChapterIds = ["ch01"];
    usedFallback = true;
  } else if (primaryChapterIds.length > 3) {
    primaryChapterIds = primaryChapterIds.slice(0, 3);
  }

  const scores = Object.fromEntries(chapterScores.entries());

  return {
    primaryChapterIds,
    debug: {
      explicitChapter,
      keywordHits,
      scores,
      usedFallback,
      chapterTitles: CHAPTER_TITLES,
      primaryChapterIds,
      contextMode: "full-skill",
    },
  };
}

/** Tutti i file della skill (il router indica solo i capitoli più pertinenti). */
export function filesForContext(): string[] {
  return [...FULL_SKILL_FILES];
}

export function primaryChapterHint(ids: string[], debug: RouteDebug): string {
  if (ids.length === 0) return "";
  const names = ids.map((id) => debug.chapterTitles[id] ?? id).join(", ");
  return `Capitoli più pertinenti per questa domanda: ${names}.`;
}
