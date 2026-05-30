/** Coda globale: max 1 richiesta ElevenLabs alla volta (piani free ≈ 2 concurrent). */
let chain: Promise<unknown> = Promise.resolve();

export function withElevenLabsSlot<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn);
  chain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}
