import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGroq } from "./groq-client";

// Client sends the already-computed LearningReports (each one produced by
// the existing analyzeVideo pipeline) — merge only needs the condensed
// fields below, not full transcripts, which keeps this call cheap even
// at 5 videos.
const inputReportSchema = z.object({
  url: z.string(),
  title: z.string(),
  channel: z.string(),
  category: z.string(),
  overallScore: z.number(),
  timeSavedSec: z.number(),
  durationSec: z.number(),
  executiveSummary: z.string(),
  keyInsights: z.array(z.object({ title: z.string(), body: z.string() })),
  chapters: z.array(z.object({ title: z.string() })),
});
export type MergeInputReport = z.infer<typeof inputReportSchema>;

const mergedSchema = z.object({
  overallSummary: z.string(),
  commonInsights: z.array(z.string()).min(2).max(6),
  differentOpinions: z
    .array(
      z.object({
        topic: z.string(),
        viewpoints: z
          .array(z.object({ source: z.string(), view: z.string() }))
          .min(2),
      }),
    )
    .default([]),
  bestPerVideo: z
    .array(z.object({ videoTitle: z.string(), videoUrl: z.string(), insight: z.string() }))
    .min(1),
  roadmap: z
    .array(z.object({ order: z.number(), videoTitle: z.string(), videoUrl: z.string(), reason: z.string() }))
    .min(1),
  actionPlan: z.array(z.string()).min(3).max(8),
});

export interface MergedReport {
  videoCount: number;
  overallSummary: string;
  commonInsights: string[];
  differentOpinions: { topic: string; viewpoints: { source: string; view: string }[] }[];
  bestPerVideo: { videoTitle: string; videoUrl: string; insight: string }[];
  roadmap: { order: number; videoTitle: string; videoUrl: string; reason: string }[];
  actionPlan: string[];
  totalTimeSavedSec: number;
  totalDurationSec: number;
  sourceVideos: { title: string; url: string; channel: string; overallScore: number }[];
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

export const mergeReports = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ reports: z.array(inputReportSchema).min(2).max(5) }).parse(input),
  )
  .handler(async ({ data }): Promise<MergedReport> => {
    const { reports } = data;

    const system = `You are WiseTube AI, an expert research analyst. You will be given condensed learning reports for ${reports.length} YouTube videos that all cover the same or a closely related topic. Your job is to synthesize them into ONE unified "master" learning guide — do not just summarize each video separately. Actively cross-reference: find what multiple sources genuinely agree on, and find real points where they differ in approach, opinion, or emphasis (do not invent disagreement if there isn't any — an empty differentOpinions array is fine and expected when sources are aligned). Use each video's exact title as given when referencing it, and use its exact URL when citing it as a source. Return JSON only, matching this shape exactly:
{
  "overallSummary": string, // 3-5 sentences synthesizing all videos into one coherent narrative of the topic
  "commonInsights": [string], // 2-6 ideas that most or all of the videos agree on, each a complete standalone sentence
  "differentOpinions": [ { "topic": string, "viewpoints": [ { "source": string, "view": string } ] } ], // real disagreements only; "source" = video title; empty array if sources are aligned
  "bestPerVideo": [ { "videoTitle": string, "videoUrl": string, "insight": string } ], // exactly one standout takeaway per input video, in the same order given
  "roadmap": [ { "order": number, "videoTitle": string, "videoUrl": string, "reason": string } ], // the best SEQUENCE to consume these videos to learn the topic well, 1-indexed order, one entry per video, reason explains why it belongs at that point in the sequence
  "actionPlan": [string] // 3-8 concrete, practical next steps a learner should take, compiled across all videos, each a complete actionable sentence
}`;

    const user = `Here are the ${reports.length} video reports to merge:\n\n${reports
      .map(
        (r, i) => `--- VIDEO ${i + 1} ---
Title: ${r.title}
URL: ${r.url}
Channel: ${r.channel}
Category: ${r.category}
Score: ${r.overallScore}/10
Executive Summary: ${r.executiveSummary}
Key Insights:
${r.keyInsights.map((k) => `- ${k.title}: ${k.body}`).join("\n")}
Chapters: ${r.chapters.map((c) => c.title).join(", ")}`,
      )
      .join("\n\n")}\n\nReturn the merged JSON report now.`;

    const content = await callGroq({
      models: ["openai/gpt-oss-120b"],
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      maxTokens: 2200,
      temperature: 0.3,
      keyOffset: 2,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(content));
    } catch {
      throw new Error("AI returned malformed output while merging videos.");
    }
    const m = mergedSchema.parse(parsed);

    // Totals are computed deterministically from real report data, never
    // trusted to the model's arithmetic.
    const totalTimeSavedSec = reports.reduce((acc, r) => acc + r.timeSavedSec, 0);
    const totalDurationSec = reports.reduce((acc, r) => acc + r.durationSec, 0);

    return {
      videoCount: reports.length,
      overallSummary: m.overallSummary,
      commonInsights: m.commonInsights,
      differentOpinions: m.differentOpinions,
      bestPerVideo: m.bestPerVideo,
      roadmap: [...m.roadmap].sort((a, b) => a.order - b.order),
      actionPlan: m.actionPlan,
      totalTimeSavedSec,
      totalDurationSec,
      sourceVideos: reports.map((r) => ({
        title: r.title,
        url: r.url,
        channel: r.channel,
        overallScore: r.overallScore,
      })),
    };
  });
