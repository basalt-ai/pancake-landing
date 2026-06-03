import "server-only";

import {
  SEED_IDEAS,
  type RoadmapIdea,
  type RoadmapStatus,
  type RoadmapTag,
} from "@/components/sections/roadmap/roadmap-data";
import { isBackendConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Raw `ideas` row shape from Supabase. */
type IdeaRow = {
  id: string;
  title: string;
  description: string;
  tag: RoadmapTag;
  status: RoadmapStatus;
  author_name: string | null;
  vote_count: number;
};

export function mapIdeaRow(row: IdeaRow): RoadmapIdea {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tag: row.tag,
    status: row.status,
    authorName: row.author_name,
    voteCount: row.vote_count,
  };
}

export type IdeasResult = {
  ideas: RoadmapIdea[];
  /** Where the data came from — drives the "preview mode" notice + UI gating. */
  source: "supabase" | "seed";
};

/**
 * Fetch ideas for the page. Falls back to the static seed (read-only) whenever
 * Supabase isn't configured or the query fails, so the page always renders.
 */
export async function getIdeas(): Promise<IdeasResult> {
  if (!isBackendConfigured()) {
    return { ideas: SEED_IDEAS, source: "seed" };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { ideas: SEED_IDEAS, source: "seed" };

  const { data, error } = await supabase
    .from("ideas")
    .select("id, title, description, tag, status, author_name, vote_count")
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { ideas: SEED_IDEAS, source: "seed" };
  }

  return { ideas: (data as IdeaRow[]).map(mapIdeaRow), source: "supabase" };
}
