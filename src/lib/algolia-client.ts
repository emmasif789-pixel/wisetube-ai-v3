// Server-only Algolia wrapper. Two jobs:
//  1. index every finished Learning Report so it becomes searchable
//  2. search across previously analyzed videos
//
// Since this project has no database, Algolia doubles as the persistence
// layer for "videos we've already analyzed" — not just a search bolt-on.
//
// Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY in your environment (Vercel
// project settings). Get both from https://dashboard.algolia.com/account/api-keys
// — ALGOLIA_ADMIN_KEY is the "Admin API Key" (server-side only, never
// exposed to the client since these calls only ever run in server fns).
// If either var is missing, indexing/search silently no-op instead of
// breaking video analysis.
import algoliasearch from "algoliasearch";

const INDEX_NAME = "wisetube_reports";

function getClient() {
  const appId = process.env.ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  if (!appId || !adminKey) return null;
  return algoliasearch(appId, adminKey);
}

export interface IndexedReport {
  objectID: string; // videoId — re-indexing the same video overwrites cleanly
  videoId: string;
  url: string;
  title: string;
  channel: string;
  category: string;
  worthWatching: string;
  overallScore: number;
  executiveSummary: string;
  chapterTitles: string[];
  keyInsightTitles: string[];
  indexedAt: number;
}

// Fire-and-forget from the caller's perspective: never throws, so a
// misconfigured or down Algolia index can never break video analysis.
export async function indexReport(report: IndexedReport): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    const index = client.initIndex(INDEX_NAME);
    await index.saveObject(report);
  } catch (err) {
    console.error("Algolia indexing failed (non-fatal):", err);
  }
}

export interface SearchHit {
  objectID: string;
  videoId: string;
  url: string;
  title: string;
  channel: string;
  category: string;
  worthWatching: string;
  overallScore: number;
  executiveSummary: string;
}

export async function searchReports(query: string): Promise<SearchHit[]> {
  const client = getClient();
  if (!client) return [];
  try {
    const index = client.initIndex(INDEX_NAME);
    const { hits } = await index.search<SearchHit>(query, { hitsPerPage: 8 });
    return hits.map((h) => ({
      objectID: h.objectID,
      videoId: h.videoId,
      url: h.url,
      title: h.title,
      channel: h.channel,
      category: h.category,
      worthWatching: h.worthWatching,
      overallScore: h.overallScore,
      executiveSummary: h.executiveSummary,
    }));
  } catch (err) {
    console.error("Algolia search failed (non-fatal):", err);
    return [];
  }
}
