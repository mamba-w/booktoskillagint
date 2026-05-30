import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="app-shell safe-x mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden">
      <header className="safe-top shrink-0 border-b border-zinc-800/80 pb-3 pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-500">
          Agenti Intelligenti
        </p>
        <h1 className="mt-0.5 text-lg font-semibold leading-tight tracking-tight text-zinc-50 sm:text-2xl">
          Tutor — Altair&apos;s Notes
        </h1>
        <p className="mt-0.5 hidden text-sm text-zinc-500 sm:block">
          Foto di esercizi · risposte dagli appunti del corso
        </p>
      </header>
      <main className="min-h-0 flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}
