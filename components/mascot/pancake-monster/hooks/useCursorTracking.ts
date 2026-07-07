import { useEffect, useRef, useState, type RefObject } from "react";

const FORK_THRESHOLD = 300;

/* Touch-device idle wander orbit — deliberately OUTSIDE the fork threshold
   so the fork stays a pointer-chase easter egg; the eyes still track the
   moving point (direction matters, not distance). */
const WANDER_RADIUS = 360;

interface CursorInfo {
  dx: number;
  dy: number;
  distance: number;
  isForkActive: boolean;
  cursorPos: { x: number; y: number };
}

/**
 * `getTarget` (optional): when provided, the hook uses its return value as the
 * "cursor" position (in window-relative coords) instead of the real mouse —
 * lets the monster track an arbitrary target, e.g. the nearest logo chip.
 * The function is called every animation frame.
 */
export function useCursorTracking(
  monsterRef: RefObject<HTMLElement | null>,
  getTarget?: () => { x: number; y: number } | null,
) {
  const [info, setInfo] = useState<CursorInfo>({
    dx: 0,
    dy: 0,
    distance: Infinity,
    isForkActive: false,
    cursorPos: { x: 0, y: 0 },
  });

  const rafRef = useRef<number>(0);
  const latestMouse = useRef<{ x: number; y: number } | null>(null);
  const getTargetRef = useRef(getTarget);
  getTargetRef.current = getTarget;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      latestMouse.current = { x: e.clientX, y: e.clientY };
    };

    /* Touch devices never fire mousemove, which used to leave the monster
       frozen (mobile review 2026-07-07). When no real pointer has spoken,
       wander the gaze along a slow lissajous orbit instead — desktop
       behavior is untouched (first mousemove wins forever). */
    const wanders =
      window.matchMedia("(hover: none)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = (now: number) => {
      if (monsterRef.current) {
        const rect = monsterRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const overridden = getTargetRef.current?.();
        let target = overridden ?? latestMouse.current;
        if (!target && wanders) {
          const t = now / 1000;
          target = {
            x: cx + Math.sin(t * 0.42 + 1.3) * WANDER_RADIUS * (0.75 + 0.25 * Math.sin(t * 0.11)),
            y: cy + Math.cos(t * 0.31) * WANDER_RADIUS * 0.45,
          };
        }
        if (target) {
          const { x, y } = target;
          const dx = x - cx;
          const dy = y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          setInfo({
            dx,
            dy,
            distance,
            isForkActive: distance < FORK_THRESHOLD,
            cursorPos: { x, y },
          });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [monsterRef]);

  return info;
}
