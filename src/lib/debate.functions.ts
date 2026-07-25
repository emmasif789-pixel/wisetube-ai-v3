import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGroq } from "./groq-client";

export type DebateResult =
  | {
      mode: "debate";
      mainViewpoint: string[];
      counterargument: string[];
      balancedConclusion: string;
    }
  | {
      mode: "alternatives";
      primaryApproach: string[];
      alternativeApproaches: string[];
      recommendation: string;
    };

function extractJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const f = s.search(/[{[]/);
  if (f === -1) throw new Error("no json");
  const open = s[f];
  const close = open === "{" ? "}" : "]";
  const l = s.lastIndexOf(close);
  if (l <= f) throw new Error("no json");
  return s.slice(f, l + 1);
}

const contextSchema = z.object({
  title: z.string(),
  category: z.string(),
  executiveSummary: z.string(),
  keyInsights: z.array(z.object({ title: z.string(), body: z.string() })),
});

const debateSchema = z.object({
  mainViewpoint: z.array(z.string()).min(2).max(4),
  counterargument: z.array(z.string()).min(2).max(4),
  balancedConclusion: z.string(),
});

const alternativesSchema = z.object({
  primaryApproach: z.array(z.string()).min(2).max(4),
  alternativeApproaches: z.array(z.string()).min(2).max(4),
  recommendation: z.string(),
});

// Categories where opposing viewpoints make sense. Anything else (tutorials,
// how-tos, factual/technical walkthroughs) gets "Alternative Approaches"
// instead — comparing methods rather than forcing a debate that wouldn't
// make sense for content like "how to center a div in CSS".
// This branch is decided from the `category` field the main report already
// generates — no extra Groq call needed just to classify the video.
const DEBATE_CATEGORIES = [
  "self-improvement",
  "personal growth",
  "business",
  "politics",
  "history",
  "philosophy",
  "current affairs",
  "opinion",
  "society",
  "psychology",
  "productivity",
];

function shouldUseDebateMode(category: string): boolean {
  const c = category.toLowerCase();
  return DEBATE_CATEGORIES.some((k) => c.includes(k));
}

export const generateDebate = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ context: contextSchema }).parse(i))
  .handler(async ({ data }): Promise<DebateResult> => {
    const useDebate = shouldUseDebateMode(data.context.category);

    const ctx = `Video: ${data.context.title}
Category: ${data.context.category}
Summary:
${data.context.executiveSummary}
Insights:
${data.context.keyInsights.map((k) => `- ${k.title}: ${k.body}`).join("\n")}`;

    const debateSystem = `You are an educational critical-thinking assistant. Based on the video below, produce a balanced exploration of perspectives. Rules: mainViewpoint = 2-4 short bullet points summarizing the video's primary argument. counterargument = 2-4 short bullet points giving a realistic, thoughtful, educational opposing perspective — not a strawman. balancedConclusion = 2-3 neutral sentences comparing both views and when each may be valid. Return JSON only in this shape: {"mainViewpoint":[string,...],"counterargument":[string,...],"balancedConclusion":string}`;

    const alternativesSystem = `You are an educational assistant helping viewers compare methods. Based on the tutorial/factual video below, produce a comparison of approaches. Rules: primaryApproach = 2-4 short bullet points summarizing the method/approach shown in the video. alternativeApproaches = 2-4 short bullet points describing other valid methods to achieve the same goal, and briefly why someone might choose them instead. recommendation = 2-3 neutral sentences on when to use the video's approach vs. the alternatives. Return JSON only in this shape: {"primaryApproach":[string,...],"alternativeApproaches":[string,...],"recommendation":string}`;

    const content = await callGroq({
      models: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"],
      messages: [
        { role: "system", content: useDebate ? debateSystem : alternativesSystem },
        { role: "user", content: ctx },
      ],
      maxTokens: 700,
      temperature: 0.6,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(content));
    } catch {
      throw new Error("AI returned malformed output.");
    }

    if (useDebate) {
      const r = debateSchema.parse(parsed);
      return { mode: "debate", ...r };
    } else {
      const r = alternativesSchema.parse(parsed);
      return { mode: "alternatives", ...r };
    }
  });
