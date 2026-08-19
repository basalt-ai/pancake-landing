const AIRTABLE_BASE_ID_RE = /^app[a-zA-Z0-9]{14}$/;

/** Trim deployment-UI whitespace while rejecting internal CR/LF in headers. */
export function normalizeAirtableToken(value: string | undefined) {
  const token = value?.trim();
  return token && !/[\r\n]/.test(token) ? token : undefined;
}

export function normalizeAirtableBaseId(value: string | undefined) {
  const baseId = value?.trim();
  return baseId && AIRTABLE_BASE_ID_RE.test(baseId) ? baseId : undefined;
}
