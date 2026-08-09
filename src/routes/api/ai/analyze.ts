import { createFileRoute } from "@tanstack/react-router";
import { analyzeVideo } from "@/lib/analyze.functions";
import { corsJson, corsError, corsOptions } from "@/lib/cors";

export const Route = createFileRoute("/api/ai/analyze")({
  server: {
    handlers: {
      OPTIONS: async () => corsOptions(),
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as { videoId?: string };
          if (!body.videoId) return corsError("videoId is required", 400);

          const url = `https://www.youtube.com/watch?v=${body.videoId}`;
          // Calling the existing server function directly, in-process — this
          // is the SAME code path your website's report page already uses
          // and already has working in production. No logic duplicated here.
          const report = await analyzeVideo({ data: { url } });
          return corsJson(report);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Analysis failed";
          return corsError(message, 500);
        }
      },
    },
  },
});
