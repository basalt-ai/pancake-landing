import { createHmac } from "node:crypto";

// This module is server-only by construction: importing node:crypto prevents
// it from entering the browser bundle. Keep the shared field contract here so
// Airtable reads, writes, and recovery checks cannot silently drift.
export const WAITLIST_DELIVERY_VERSION = "waitlist-v2";
export const WAITLIST_DELIVERY_VERSION_FIELD = "Analytics Delivery Version";
export const WAITLIST_EVENT_ID_FIELD = "Analytics Event ID";
export const WAITLIST_SUBMISSION_ID_FIELD = "Analytics Submission ID";
export const WAITLIST_SLACK_DELIVERED_AT_FIELD = "Slack Delivered At";
export const WAITLIST_META_CAPI_DELIVERED_AT_FIELD = "Meta CAPI Delivered At";

const SUBMISSION_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEAD_EVENT_ID_RE = /^lead\.[0-9a-f]{64}$/;

export function isWaitlistSubmissionId(value: unknown): value is string {
  return typeof value === "string" && SUBMISSION_ID_RE.test(value.trim());
}

export function createWaitlistLeadEventId(email: string, secret: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedSecret = secret.trim();
  if (normalizedSecret.length < 32) {
    throw new Error("ANALYTICS_EVENT_ID_SECRET must contain at least 32 characters");
  }

  const digest = createHmac("sha256", normalizedSecret)
    .update(`pancake:waitlist-v2:${normalizedEmail}`)
    .digest("hex");
  return `lead.${digest}`;
}

export function cleanAirtableString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : undefined;
}

export function isSuccessfulDeliveryTimestamp(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function inspectWaitlistDelivery(
  fields: Record<string, unknown>,
  expectedEventId: string,
  submissionId: string,
) {
  const storedVersion = cleanAirtableString(fields[WAITLIST_DELIVERY_VERSION_FIELD], 100);
  const storedEventId = cleanAirtableString(fields[WAITLIST_EVENT_ID_FIELD], 100);
  const storedSubmissionId = cleanAirtableString(
    fields[WAITLIST_SUBMISSION_ID_FIELD],
    100,
  )?.toLowerCase();
  const eligible =
    storedVersion === WAITLIST_DELIVERY_VERSION &&
    storedEventId === expectedEventId &&
    LEAD_EVENT_ID_RE.test(storedEventId);

  return {
    eligible,
    recoverable: eligible && storedSubmissionId === submissionId.trim().toLowerCase(),
  };
}
