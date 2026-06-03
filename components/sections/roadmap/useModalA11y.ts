"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Accessibility plumbing shared by the roadmap modals:
 *   - moves focus into the dialog on open (initialFocus, else first focusable)
 *   - traps Tab/Shift+Tab inside the panel (WAI-ARIA dialog contract)
 *   - closes on Escape
 *   - returns focus to the opener on close
 *   - ref-counted body scroll lock (safe across the create→detail handoff,
 *     where one modal unmounts as another mounts in the same commit)
 *
 * Returns a ref to attach to the panel element (give it tabIndex={-1}).
 */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let scrollLockCount = 0;
let savedOverflow = "";

function lockScroll() {
  if (scrollLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLockCount += 1;
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = savedOverflow;
}

export function useModalA11y(
  active: boolean,
  onClose: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the latest onClose without re-running the effect each render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    lockScroll();

    const focusInitial = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const target =
        initialFocusRef?.current ??
        panel.querySelector<HTMLElement>(FOCUSABLE) ??
        panel;
      target.focus();
    };
    const t = window.setTimeout(focusInitial, 20);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (current === first || !panel.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else if (current === last || !panel.contains(current)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown, true);
      unlockScroll();
      // Return focus to whatever opened the modal, if it's still around.
      opener?.focus?.();
    };
  }, [active, initialFocusRef]);

  return panelRef;
}
