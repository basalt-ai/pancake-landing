import { listAllRecords, type AirtableRecord, TABLES } from "./airtable";
import { normalizeAirtableBaseId, normalizeAirtableToken } from "./airtable-config";

export type Point = { date: string; value: number };

export type Metrics = {
  /** All rows in the signups table (= last point of cumulative signups). */
  totalSignups: number;
  /** Rows with no day bucket (neither valid Signup Date nor record `createdTime`). Should be 0. */
  signupsWithoutDate: number;
  /** Count of rows where we used `createdTime` because `Signup Date` was empty. */
  bucketedWithCreatedTime: number;
  ambassadors: number;
  invitesSent: number;
  conversionPct: number;
  /** Sorted ASC by date, densely filled (one point per day). */
  dailySignups: Point[];
  dailyAmbassadors: Point[];
  cumulativeSignups: Point[];
  cumulativeAmbassadors: Point[];
  todaySignups: number;
  updatedAt: string;
};

/**
 * Bucket by calendar day in UTC. Plain `YYYY-MM-DD` from Airtable is used as-is
 * so we don’t shift a local-midnight instant into the previous/next UTC day.
 */
function toUtcDay(raw: string | undefined): string | null {
  if (raw == null) return null;
  const t = String(raw).trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * Day used for analytics: `Signup Date` if set, else Airtable record `createdTime` (always present in API).
 */
function bucketDayForRecord(r: AirtableRecord): { day: string | null; usedCreatedTime: boolean } {
  const signup = toUtcDay(r.fields["Signup Date"] as string | undefined);
  if (signup) return { day: signup, usedCreatedTime: false };
  if (r.createdTime) {
    const d = toUtcDay(r.createdTime);
    if (d) return { day: d, usedCreatedTime: true };
  }
  return { day: null, usedCreatedTime: false };
}

function isoDay(input: string | number | Date): string {
  return new Date(input).toISOString().slice(0, 10);
}

function addDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function buildDateRange(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  let cursor = startIso;
  while (cursor <= endIso) {
    out.push(cursor);
    cursor = addDay(cursor);
  }
  return out;
}

export async function getMetrics(): Promise<Metrics> {
  if (
    !normalizeAirtableToken(process.env.AIRTABLE_TOKEN) ||
    !normalizeAirtableBaseId(process.env.AIRTABLE_BASE_ID)
  ) {
    throw new Error("AIRTABLE env vars missing");
  }

  const records = await listAllRecords(TABLES.signups, {
    fields: ["Signup Date", "Referral Count"],
    sortField: "Signup Date",
    sortDirection: "asc",
  });

  const dailySignupMap = new Map<string, number>();
  const dailyAmbassadorMap = new Map<string, number>();
  let invitesSent = 0;
  let ambassadors = 0;
  let signupsWithoutDate = 0;
  let bucketedWithCreatedTime = 0;

  for (const r of records) {
    const refCount = Number(r.fields["Referral Count"] ?? 0);
    if (Number.isFinite(refCount) && refCount > 0) {
      invitesSent += refCount;
      ambassadors += 1;
    }

    const { day, usedCreatedTime } = bucketDayForRecord(r);
    if (!day) {
      signupsWithoutDate += 1;
      continue;
    }
    if (usedCreatedTime) bucketedWithCreatedTime += 1;
    dailySignupMap.set(day, (dailySignupMap.get(day) ?? 0) + 1);
    if (Number.isFinite(refCount) && refCount > 0) {
      dailyAmbassadorMap.set(day, (dailyAmbassadorMap.get(day) ?? 0) + 1);
    }
  }

  const totalSignups = records.length;
  const conversionPct = records.length === 0 ? 0 : (ambassadors / records.length) * 100;

  const allDays = Array.from(dailySignupMap.keys()).sort();
  const today = isoDay(new Date());

  if (allDays.length === 0) {
    return {
      totalSignups,
      signupsWithoutDate,
      bucketedWithCreatedTime,
      ambassadors,
      invitesSent,
      conversionPct,
      dailySignups: [],
      dailyAmbassadors: [],
      cumulativeSignups: [],
      cumulativeAmbassadors: [],
      todaySignups: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const start = allDays[0];
  const end = today > allDays[allDays.length - 1] ? today : allDays[allDays.length - 1];
  const days = buildDateRange(start, end);

  const dailySignups: Point[] = days.map((d) => ({
    date: d,
    value: dailySignupMap.get(d) ?? 0,
  }));
  const dailyAmbassadors: Point[] = days.map((d) => ({
    date: d,
    value: dailyAmbassadorMap.get(d) ?? 0,
  }));

  let cs = 0;
  const cumulativeSignups: Point[] = dailySignups.map((p) => {
    cs += p.value;
    return { date: p.date, value: cs };
  });

  let ca = 0;
  const cumulativeAmbassadors: Point[] = dailyAmbassadors.map((p) => {
    ca += p.value;
    return { date: p.date, value: ca };
  });

  return {
    totalSignups,
    signupsWithoutDate,
    bucketedWithCreatedTime,
    ambassadors,
    invitesSent,
    conversionPct,
    dailySignups,
    dailyAmbassadors,
    cumulativeSignups,
    cumulativeAmbassadors,
    todaySignups: dailySignupMap.get(today) ?? 0,
    updatedAt: new Date().toISOString(),
  };
}
