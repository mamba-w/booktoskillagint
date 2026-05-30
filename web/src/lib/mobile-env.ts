export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/i.test(navigator.userAgent);
}

export function isSecureContext(): boolean {
  if (typeof window === "undefined") return true;
  return window.isSecureContext;
}

export function mobileMicBlockedReason(): string | null {
  if (typeof window === "undefined") return null;
  if (isSecureContext()) return null;
  return isIOS()
    ? "Su iPhone serve HTTPS (non http://). Avvia il server con npm run dev e apri https://IP-del-Mac:3000, poi accetta il certificato."
    : "Microfono e voce richiedono una connessione sicura (HTTPS).";
}
