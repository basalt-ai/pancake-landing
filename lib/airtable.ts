import { normalizeAirtableBaseId, normalizeAirtableToken } from "./airtable-config";

// Shared Airtable helper for Pancake

const TABLES = {
  signups: "tblXBOYUY7OfKItXz",
} as const;

function airtableUrl(table: string, extra = "") {
  const baseId = normalizeAirtableBaseId(process.env.AIRTABLE_BASE_ID);
  if (!baseId) throw new Error("AIRTABLE_BASE_ID is missing or invalid");
  return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}${extra}`;
}

function headers() {
  const token = normalizeAirtableToken(process.env.AIRTABLE_TOKEN);
  if (!token) throw new Error("AIRTABLE_TOKEN is missing or invalid");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** Airtable returns `createdTime` (ISO) on every record, even when you only request `fields[]`. */
export type AirtableRecord = {
  id: string;
  createdTime?: string;
  fields: Record<string, unknown>;
};

export async function listAllRecords(
  table: string,
  options: {
    fields?: string[];
    filterFormula?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
  } = {},
): Promise<AirtableRecord[]> {
  const all: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams();
    params.set("pageSize", "100");
    if (options.filterFormula) params.set("filterByFormula", options.filterFormula);
    if (options.sortField) {
      params.append("sort[0][field]", options.sortField);
      params.append("sort[0][direction]", options.sortDirection ?? "asc");
    }
    for (const f of options.fields ?? []) params.append("fields[]", f);
    if (offset) params.set("offset", offset);

    const res = await fetch(airtableUrl(table, `?${params}`), {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Airtable list error: ${await res.text()}`);
    const data = (await res.json()) as {
      records: Array<{
        id: string;
        createdTime: string;
        fields: Record<string, unknown>;
      }>;
      offset?: string;
    };
    for (const rec of data.records) {
      all.push({
        id: rec.id,
        createdTime: rec.createdTime,
        fields: rec.fields,
      });
    }
    offset = data.offset;
  } while (offset);
  return all;
}

export { TABLES };
