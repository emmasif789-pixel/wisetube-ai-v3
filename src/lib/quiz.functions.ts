import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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
  executiveSummary: z.string(),
  keyInsights: z.array(z.object({ title: z.string(), body: z.string() })),
  chapters: z.array(z.object({ title: z.string(), summary: z.string() })),
});
const outputSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().default(""),
      }),
    )
    .min(1),
});
export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z.object({ context: contextSchema }).parse(i),
  )
  .handler(async ({ data }): Promise<{ questions: QuizQuestion[] }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey)
      throw new Error(
        "AI key missing. Please add your GROQ_API_KEY to enable the quiz.",
      );
    const ctx = `Video: ${data.context.title}
Summary:
${data.context.executiveSummary}
Insights:
${data.context.keyInsights.map((k) => `- ${k.title}: ${k.body}`).join("\n")}
Chapters:
${data.context.chapters.map((c) => `- ${c.title}: ${c.summary}`).join("\n")}`;
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Generate a 5-question multiple-choice quiz that tests real comprehension of the video below. Rules: each question must have exactly 4 plausible options and exactly one correct answer. Vary correctIndex (0-3) across questions. Include a short explanation. Return JSON only in this shape: {"questions":[{"question":string,"options":[string,string,string,string],"correctIndex":number,"explanation":string}]}`,
            },
            { role: "user", content: ctx },
          ],
          temperature: 0.5,
          max_tokens: 1200,
        }),
      },
    );
    if (!res.ok) {
      if (res.status === 429)
        throw new Error("AI is busy right now. Please try again in a moment.");
      if (res.status === 413)
        throw new Error("This video's content is too large for quiz generation. Please try another video.");
      throw new Error("Quiz generation failed. Please try again.");
    }
    const j = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = j.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned an empty quiz.");
    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(content));
    } catch {
      throw new Error("AI returned malformed quiz output.");
    }
    return outputSchema.parse(parsed);
  });
