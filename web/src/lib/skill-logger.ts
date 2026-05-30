type LogLevel = "info" | "warn" | "error";

let seq = 0;

export function newRequestId(): string {
  seq += 1;
  return `req-${Date.now().toString(36)}-${seq}`;
}

export function skillLog(
  requestId: string,
  step: string,
  message: string,
  data?: Record<string, unknown>,
  level: LogLevel = "info",
): void {
  const prefix = `[skill][${requestId}][${step}]`;
  const line = data ? `${message} ${JSON.stringify(data)}` : message;
  if (level === "error") console.error(prefix, line);
  else if (level === "warn") console.warn(prefix, line);
  else console.log(prefix, line);
}

export function skillSection(requestId: string, title: string): void {
  console.log(`\n[skill][${requestId}] ══════ ${title} ══════`);
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
