import assert from "node:assert/strict";
import test from "node:test";

import {
  createWaitlistLeadEventId,
  inspectWaitlistDelivery,
  isSuccessfulDeliveryTimestamp,
  isWaitlistSubmissionId,
  WAITLIST_DELIVERY_VERSION,
  WAITLIST_DELIVERY_VERSION_FIELD,
  WAITLIST_EVENT_ID_FIELD,
  WAITLIST_SUBMISSION_ID_FIELD,
} from "../lib/analytics/waitlist-delivery.ts";
import { submissionAttemptForEmail } from "../lib/analytics/submission-id.ts";
import {
  isReportWaitlistResult,
  parseLandingWaitlistResult,
} from "../lib/analytics/waitlist-response.ts";
import {
  normalizeAirtableBaseId,
  normalizeAirtableToken,
} from "../lib/airtable-config.ts";

const secret = "test-secret-that-is-at-least-thirty-two-characters";
const submissionId = "123e4567-e89b-42d3-a456-426614174000";

test("event IDs are opaque, normalized, and stable", () => {
  const first = createWaitlistLeadEventId("  Founder@Example.com ", secret);
  const retry = createWaitlistLeadEventId("founder@example.com", secret);
  const other = createWaitlistLeadEventId("other@example.com", secret);

  assert.match(first, /^lead\.[0-9a-f]{64}$/);
  assert.equal(first, retry);
  assert.notEqual(first, other);
  assert.equal(first.includes("founder"), false);
  assert.throws(() => createWaitlistLeadEventId("founder@example.com", "too-short"));
});

test("only the persisted v2 submission owner can recover the browser conversion", () => {
  const eventId = createWaitlistLeadEventId("founder@example.com", secret);
  const fields = {
    [WAITLIST_DELIVERY_VERSION_FIELD]: WAITLIST_DELIVERY_VERSION,
    [WAITLIST_EVENT_ID_FIELD]: eventId,
    [WAITLIST_SUBMISSION_ID_FIELD]: submissionId,
  };

  assert.deepEqual(inspectWaitlistDelivery(fields, eventId, submissionId), {
    eligible: true,
    recoverable: true,
  });
  assert.deepEqual(
    inspectWaitlistDelivery(fields, eventId, "123e4567-e89b-42d3-b456-426614174001"),
    { eligible: true, recoverable: false },
  );
  assert.deepEqual(inspectWaitlistDelivery({}, eventId, submissionId), {
    eligible: false,
    recoverable: false,
  });
});

test("submission IDs and delivery timestamps reject malformed values", () => {
  assert.equal(isWaitlistSubmissionId(submissionId), true);
  assert.equal(isWaitlistSubmissionId("not-a-uuid"), false);
  assert.equal(isSuccessfulDeliveryTimestamp("2026-08-17T12:34:56.000Z"), true);
  assert.equal(isSuccessfulDeliveryTimestamp("not-a-date"), false);
  assert.equal(isSuccessfulDeliveryTimestamp(undefined), false);
});

test("browser submission IDs persist only across retries for the same email", () => {
  const first = submissionAttemptForEmail(null, " Founder@Example.com ");
  const retry = submissionAttemptForEmail(first, "founder@example.com");
  const other = submissionAttemptForEmail(retry, "other@example.com");

  assert.equal(retry, first);
  assert.match(first.id, /^[0-9a-f-]{36}$/);
  assert.notEqual(other.id, first.id);
});

test("landing and report callers reject malformed 2xx response contracts", () => {
  const eventId = createWaitlistLeadEventId("founder@example.com", secret);
  assert.deepEqual(
    parseLandingWaitlistResult({
      ok: true,
      newly_created: true,
      recovered_conversion: false,
      conversion_event_id: eventId,
    }),
    { kind: "created", eventId },
  );
  assert.deepEqual(
    parseLandingWaitlistResult({
      ok: true,
      newly_created: false,
      recovered_conversion: false,
      conversion_event_id: null,
    }),
    { kind: "duplicate", eventId: null },
  );
  assert.equal(parseLandingWaitlistResult({ ok: true }), null);
  assert.equal(
    parseLandingWaitlistResult({
      ok: true,
      newly_created: true,
      recovered_conversion: false,
      conversion_event_id: "malformed",
    }),
    null,
  );
  assert.equal(
    isReportWaitlistResult({
      ok: true,
      newly_created: true,
      recovered_conversion: false,
      conversion_event_id: null,
    }),
    true,
  );
  assert.equal(isReportWaitlistResult(null), false);
});

test("Airtable configuration trims surrounding whitespace and rejects internal CR/LF", () => {
  assert.equal(normalizeAirtableToken(" \npat-example-token\r\n"), "pat-example-token");
  assert.equal(normalizeAirtableToken("pat-example\ntoken"), undefined);
  assert.equal(normalizeAirtableToken("   "), undefined);
  assert.equal(normalizeAirtableBaseId("  app12345678901234\n"), "app12345678901234");
  assert.equal(normalizeAirtableBaseId("app-invalid"), undefined);
});
