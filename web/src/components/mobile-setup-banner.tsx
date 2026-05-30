"use client";

import { isIOS, isSecureContext } from "@/lib/mobile-env";
import { useEffect, useState } from "react";

export function MobileSetupBanner() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setShow(!isSecureContext());
    setIos(isIOS());
  }, []);

  if (!show) return null;

  return (
    <div
      className="mx-1 mb-2 rounded-2xl border border-amber-500/50 bg-amber-500/15 px-3.5 py-3 text-sm leading-snug text-amber-50"
      role="alert"
    >
      <p className="font-semibold">iPhone: connessione non sicura</p>
      <p className="mt-1 text-amber-100/90">
        Con <strong>http://</strong> microfono, foto e audio spesso non funzionano.
        Sul Mac esegui{" "}
        <code className="rounded bg-black/30 px-1">npm run dev</code> e dal telefono
        apri:
      </p>
      <p className="mt-2 break-all font-mono text-xs text-amber-200">
        https://&lt;IP-del-Mac&gt;:3000
      </p>
      {ios && (
        <p className="mt-2 text-xs text-amber-200/90">
          Safari chiederà di fidarti del certificato: Avanzate → Continua.
        </p>
      )}
    </div>
  );
}
