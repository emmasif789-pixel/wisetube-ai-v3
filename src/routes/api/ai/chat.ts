import { createFileRoute } from "@tanstack/react-router";
import { chatAboutVideo } from "@/lib/chat.functions";
import { corsJson, corsError, corsOptions } from "@/lib/cors";

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      OPTIONS: async () => corsOptions(),
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as {
            question?: string;
            history?: unknown;
            context?: unknown;
          };
          if (!body.question) return corsError("question is required", 400);
          if (!body.context) return corsError("context is required", 400);

          const result = await chatAboutVideo({
            data: {
              question: body.question,
              history: (body.history as never) ?? [],
              context: body.context as never,
            },
          });
          return corsJson(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Chat failed";
          return corsError(message, 500);
        }
      },
    },
  },
});
