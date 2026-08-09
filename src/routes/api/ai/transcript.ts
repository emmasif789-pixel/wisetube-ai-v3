import { createFileRoute } from "@tanstack/react-router";
import { fetchTranscript } from "@/lib/analyze.functions";
import { corsJson, corsError, corsOptions } from "@/lib/cors";

export const Route = createFileRoute("/api/ai/transcript")({
  server: {
    handlers: {
      OPTIONS: async () => corsOptions(),
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as { videoId?: string };
          if (!body.videoId) return corsError("videoId is required", 400);

          const raw = await fetchTranscript(body.videoId);
          // Normalize {start, dur, text} -> {timestampSeconds, text} for the extension.
          const segments = raw.map((seg) => ({
            timestampSeconds: Math.floor(seg.start),
            text: seg.text,
          }));
          return corsJson(segments);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Transcript fetch failed";
          return corsError(message, 500);
        }
      },
    },
  },
});
