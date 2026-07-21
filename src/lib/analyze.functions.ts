import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { LearningReport, SkipSegmentKind } from "./report-data";

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "v"].includes(parts[0])) return parts[1] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

function extractJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const first = s.search(/[{[]/);
  if (first === -1) throw new Error("no json");
  const openCh = s[first];
  const closeCh = openCh === "{" ? "}" : "]";
  const last = s.lastIndexOf(closeCh);
  if (last <= first) throw new Error("no json");
  return s.slice(first, last + 1);
}

interface TranscriptSegment {
  start: number;
  dur: number;
  text: string;
}

async function fetchTranscript(videoId: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.TRANSCRIPT_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Transcript service key missing. Please add TRANSCRIPT_API_KEY to enable analysis.",
    );
  }

  const res = await fetch("https://www.youtube-transcript.io/api/transcripts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${apiKey}`,
    },
    body: JSON.stringify({ ids: [videoId] }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Transcript service is busy right now. Please try again in a moment.");
    throw new Error("Could not load this video. Please try another URL.");
  }

  const json = (await res.json()) as Array<{
    id?: string;
    tracks?: Array<{
      language?: string;
      transcript?: Array<{ text?: string; start?: string | number; dur?: string | number }>;
    }>;
  }>;

  const entry = json.find((e) => e.id === videoId) ?? json[0];
  const track =
    entry?.tracks?.find((t) => t.language?.toLowerCase().startsWith("en")) ??
    entry?.tracks?.[0];

  if (!track?.transcript?.length) {
    throw new Error("This video is private, unavailable, or has no transcript.");
  }

  const segs = track.transcript
    .map((t) => ({
      start: Number(t.start ?? 0),
      dur: Number(t.dur ?? 0),
      text: (t.text ?? "").replace(/\s+/g, " ").trim(),
    }))
    .filter((s) => s.text);

  if (!segs.length) throw new Error("Transcript unavailable for this video.");
  return segs;
}

const reportSchema = z.object({
  title: z.string(),
  channel: z.string().default("YouTube"),
  category: z.string().default("Education"),
  language: z.string().default("English"),
  worthWatching: z.enum(["Yes", "Skim", "No"]),
  overallScore: z.number().min(0).max(5),
  scoreExplanation: z.string(),
  scoreBreakdown: z
    .array(z.object({ label: z.string(), score: z.number().min(0).max(5) }))
    .min(3),
  executiveSummary: z.string(),
  keyInsights: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
  chapters: z
    .array(z.object({ title: z.string(), start: z.number().min(0), summary: z.string() }))
    .min(1),
  skipMap: z
    .array(
      z.object({
        kind: z.enum(["watch", "optional", "skip"]),
        label: z.string(),
        start: z.number().min(0),
        end: z.number().min(0),
        reason: z.string(),
      }),
    )
    .min(1),
});

async function generateReport(args: {
  url: string;
  videoId: string;
  transcript: string;
  durationSec: number;
}): Promise<LearningReport> {
  void 0;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI key missing. Please add your GROQ_API_KEY to enable analysis.",
    );
  }

  const system = `You are WisTube AI, an expert learning analyst. Analyze the transcript of a YouTube video and produce a rigorous Learning Report as JSON. Be honest — if the video is thin or filler-heavy, say so. All timestamps are in SECONDS and MUST be between 0 and ${args.durationSec}. Chapters must be in chronological order. Skip Map segments must cover the whole video contiguously (start=0, last end=${args.durationSec}, each segment.start = previous.end). Return JSON only, matching this shape exactly:
{
  "title": string,               // best guess of the video's title/topic
  "channel": string,             // best guess of channel/creator, or "Unknown"
  "category": string,            // e.g. "Education", "Productivity"
  "language": string,
  "worthWatching": "Yes"|"Skim"|"No",
  "overallScore": number,        // 0-5 with one decimal
  "scoreExplanation": string,    // 2-3 sentences
  "scoreBreakdown": [ {"label": string, "score": number} ],  // 6 items: Content Depth, Clarity, Accuracy, Structure, Practical Value, Beginner Friendliness
  "executiveSummary": string,    // 3-5 sentences, mention strongest section with timestamps
  "keyInsights": [ {"title": string, "body": string} ],       // 4 items
  "chapters": [ {"title": string, "start": number, "summary": string} ], // 4-7 items
  "skipMap": [ {"kind": "watch"|"optional"|"skip", "label": string, "start": number, "end": number, "reason": string} ] // 4-6 items covering the video
}`;

  const user = `Video URL: ${args.url}
Video duration: ${args.durationSec} seconds.

Transcript (each line prefixed with [start_seconds]):
${args.transcript.slice(0, 45000)}

Return the JSON report now.`;

  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  let res: Response | null = null;
  let lastStatus = 0;

  for (const model of models) {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    lastStatus = res.status;
    if (res.ok) break;
    // On rate-limit/quota errors, try the next (smaller/cheaper) model.
    if (res.status !== 429 && res.status !== 503) break;
  }

  if (!res) throw new Error("AI analysis failed. Please try again.");
  if (!res.ok) {
    if (lastStatus === 429) throw new Error("AI is busy right now. Please try again in a moment.");
    const body = await res.text().catch(() => "");
    throw new Error(`AI analysis failed (${lastStatus}). ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(content));
  } catch {
    throw new Error("AI returned malformed output.");
  }
  const r = reportSchema.parse(parsed);

  // Compute time saved from skip map (skip = full, optional = half)
  const timeSavedSec = r.skipMap.reduce((acc, s) => {
    const len = Math.max(0, s.end - s.start);
    if (s.kind === "skip") return acc + len;
    if (s.kind === "optional") return acc + len * 0.5;
    return acc;
  }, 0);

  const clampedChapters = r.chapters
    .map((c, i) => ({
      id: `c${i}`,
      title: c.title,
      start: Math.min(Math.max(0, Math.floor(c.start)), args.durationSec),
      summary: c.summary,
    }))
    .sort((a, b) => a.start - b.start);

  const clampedSkip = r.skipMap.map((s, i) => ({
    id: `s${i}`,
    kind: s.kind as SkipSegmentKind,
    label: s.label,
    start: Math.min(Math.max(0, Math.floor(s.start)), args.durationSec),
    end: Math.min(Math.max(0, Math.floor(s.end)), args.durationSec),
    reason: s.reason,
  }));

  return {
    videoId: args.videoId,
    url: args.url,
    title: r.title,
    channel: r.channel,
    category: r.category,
    language: r.language,
    durationSec: args.durationSec,
    timeSavedSec: Math.floor(timeSavedSec),
    worthWatching: r.worthWatching,
    overallScore: Math.round(r.overallScore * 10) / 10,
    scoreExplanation: r.scoreExplanation,
    scoreBreakdown: r.scoreBreakdown.map((b) => ({
      label: b.label,
      score: Math.round(b.score * 10) / 10,
    })),
    executiveSummary: r.executiveSummary,
    keyInsights: r.keyInsights,
    chapters: clampedChapters,
    skipMap: clampedSkip,
  };
}

export const analyzeVideo = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ url: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<LearningReport> => {
    const videoId = extractVideoId(data.url);
    if (!videoId) throw new Error("That doesn't look like a valid YouTube URL.");
    const transcript = await fetchTranscript(videoId);
    const last = transcript[transcript.length - 1];
    const durationSec = Math.max(60, Math.ceil(last.start + (last.dur || 0)));
    const transcriptText = transcript
      .map((t) => `[${Math.floor(t.start)}] ${t.text}`)
      .join("\n");
    return generateReport({
      url: data.url,
      videoId,
      transcript: transcriptText,
      durationSec,
    });
  });