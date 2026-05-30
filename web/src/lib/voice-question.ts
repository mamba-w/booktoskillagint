/** Parole consecutive prima di considerare l'input una domanda. */
export const QUESTION_WORD_THRESHOLD = 5;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Testo della domanda: tutto ciò che segue le prime N parole. */
export function extractQuestionText(
  text: string,
  threshold = QUESTION_WORD_THRESHOLD,
): string | null {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= threshold) return null;
  const q = words.slice(threshold).join(" ").trim();
  return q || null;
}

export function hasQuestionIntent(
  text: string,
  threshold = QUESTION_WORD_THRESHOLD,
): boolean {
  return countWords(text) > threshold;
}
