"use client";

import { useEffect, useState } from "react";

/** Allinea il composer quando la tastiera iOS riduce il visual viewport. */
export function useVisualViewport() {
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardInset(inset);
      document.documentElement.style.setProperty("--keyboard-inset", `${inset}px`);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);

  return keyboardInset;
}
