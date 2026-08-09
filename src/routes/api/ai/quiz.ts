import { createFileRoute } from "@tanstack/react-router";
import { generateQuiz } from "@/lib/quiz.functions";
import { corsJson, corsError, corsOptions } from "@/lib/cors";

export const Route = createFileRoute("/api/ai/quiz")({
  server: {
    handlers: {
      OPTIONS: async () => corsOptions(),
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as { context?: unknown };
          if (!body.context) return corsError("context is required", 400);

          // context must match { title, executiveSummary, keyInsights, chapters } —
          // exactly the shape returned by /api/ai/analyze, so the extension can
          // pass a slice of the analyze response straight through unchanged.
          const result = await generateQuiz({ data: { context: body.context as never } });
          return corsJson(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Quiz generation failed";
          return corsError(message, 500);
        }
      },
    },
  },
});
