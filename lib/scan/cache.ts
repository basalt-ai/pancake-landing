import "server-only";

import type { ScanEvent } from "./types";

/**
 * Per-domain scan cache: replays the exact event sequence for repeat scans so
 * a shared/viral domain never pays for the same APIs twice in a day.
 *
 * Same caveat as lib/rate-limit.ts: in-memory, per serverless instance. Its
 * job is cost control, not correctness — a miss just runs a fresh scan. The
 * async interface means swapping in Upstash/Vercel KV is a body-only change.
 */

const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 500;

type Entry = { events: ScanEvent[]; at: number };

const store = new Map<string, Entry>();

export async function getCachedScan(host: string): Promise<ScanEvent[] | null> {
  const entry = store.get(host);
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) {
    store.delete(host);
    return null;
  }
  return entry.events;
}

export async function setCachedScan(host: string, events: ScanEvent[]): Promise<void> {
  if (store.size >= MAX_ENTRIES) {
    let oldestKey: string | null = null;
    let oldestAt = Infinity;
    store.forEach((entry, key) => {
      if (entry.at < oldestAt) {
        oldestAt = entry.at;
        oldestKey = key;
      }
    });
    if (oldestKey) store.delete(oldestKey);
  }
  store.set(host, { events, at: Date.now() });
}
