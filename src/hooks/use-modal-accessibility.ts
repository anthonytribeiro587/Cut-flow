"use client";

import { useCallback, useEffect, useRef } from "react";

export function useModalAccessibility(open: boolean, close: () => void) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      dialogRef.current?.querySelector<HTMLElement>("button, input, select, textarea")?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const elements = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]")].filter((element) => element.offsetParent !== null);
    const first = elements[0]; const last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }, [close]);

  return { triggerRef, dialogRef, onKeyDown };
}
