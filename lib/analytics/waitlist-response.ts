type WaitlistResponse = {
  ok?: unknown;
  newly_created?: unknown;
  recovered_conversion?: unknown;
  conversion_event_id?: unknown;
};

const LEAD_EVENT_ID_RE = /^lead\.[0-9a-f]{64}$/;

function waitlistResponse(value: unknown): WaitlistResponse | null {
  return value !== null && typeof value === "object" ? (value as WaitlistResponse) : null;
}

export type LandingWaitlistResult =
  | { kind: "created" | "recovered"; eventId: string }
  | { kind: "duplicate"; eventId: null };

/** Reject a malformed 2xx so the form keeps its UUID and can retry safely. */
export function parseLandingWaitlistResult(value: unknown): LandingWaitlistResult | null {
  const response = waitlistResponse(value);
  if (!response || response.ok !== true) return null;

  const validEventId =
    typeof response.conversion_event_id === "string" &&
    LEAD_EVENT_ID_RE.test(response.conversion_event_id);
  if (
    response.newly_created === true &&
    response.recovered_conversion === false &&
    validEventId
  ) {
    return { kind: "created", eventId: response.conversion_event_id as string };
  }
  if (
    response.newly_created === false &&
    response.recovered_conversion === true &&
    validEventId
  ) {
    return { kind: "recovered", eventId: response.conversion_event_id as string };
  }
  if (
    response.newly_created === false &&
    response.recovered_conversion === false &&
    response.conversion_event_id === null
  ) {
    return { kind: "duplicate", eventId: null };
  }
  return null;
}

export function isReportWaitlistResult(value: unknown) {
  const response = waitlistResponse(value);
  return Boolean(
    response &&
      response.ok === true &&
      typeof response.newly_created === "boolean" &&
      response.recovered_conversion === false &&
      response.conversion_event_id === null,
  );
}
