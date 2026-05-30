export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\[ch[^\]]+\]/g, "")
    .replace(/\([^)]*\.md[^)]*\)/g, "")
    .replace(/[#*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitWordsForSpeech(text: string): string[] {
  return cleanTextForSpeech(text).split(/\s+/).filter(Boolean);
}
