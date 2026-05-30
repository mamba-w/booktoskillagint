const MAX_IMAGES = 4;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type ImagePayload = { mimeType: string; base64: string };

export function validateImages(images: ImagePayload[]): void {
  if (images.length === 0) return;
  if (images.length > MAX_IMAGES) {
    throw new Error(`Massimo ${MAX_IMAGES} immagini per messaggio`);
  }
  for (const img of images) {
    if (!ALLOWED.has(img.mimeType)) {
      throw new Error(`Formato non supportato: ${img.mimeType}`);
    }
    const bytes = Buffer.from(img.base64, "base64").length;
    if (bytes > MAX_BYTES) {
      throw new Error("Immagine troppo grande (max 5 MB ciascuna)");
    }
  }
}

export function dataUrlFromPayload(img: ImagePayload): string {
  return `data:${img.mimeType};base64,${img.base64}`;
}
