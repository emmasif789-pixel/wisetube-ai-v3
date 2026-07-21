import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  question: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .default([]),
  context: z.object({
    title: z.string(),
    channel: z.string(),
    executiveSummary: z.string(),
    keyInsights: z.array(
      z.object({ title: z.string(), body: z.string() }),
    ),
    chapters: z.array(
      z.object({
        title: z.string(),
        start: z.number(),
        summary: z.string(),
      }),
    ),
  }),
});

export const chatAboutVideo = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => inputSchema.parse(i))
  .handler(async ({ data }): Promise<{ answer: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "AI key missing. Please add your GROQ_API_KEY to enable Ask AI.",
      );
    }

    const ctx = `Video: ${data.context.title} — by ${data.context.channel}

Executive summary:
${data.context.executiveSummary}

Key insights:
${data.context.keyInsights.map((k) => `- ${k.title}: ${k.body}`).join("\n")}

Chapters:
${data.context.chapters
  .map((c) => `- [${Math.floor(c.start)}s] ${c.title}: ${c.summary}`)
  .join("\n")}`;

    const messages = [
      {
        role: "system" as const,
        content: `You are WisTube AI, answering questions about one specific YouTube video. Be concise (1-4 short paragraphs max), accurate, and helpful. Only use the provided context. If the answer isn't in the context, say so honestly and suggest what part of the video might cover it.\n\n${ctx}`,
      },
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: data.question },
    ];

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
          messages,
          temperature: 0.4,
        }),
      },
    );

    if (!res.ok) {
      if (res.status === 429)
        throw new Error("AI is busy right now. Please try again in a moment.");
      throw new Error("AI request failed. Please try again.");
    }
    const j = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = j.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("AI returned an empty response.");
    return { answer };
  });