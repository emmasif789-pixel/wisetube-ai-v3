import { useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, ExternalLink, Loader2, Trophy, Youtube } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { analyzeVideo } from "@/lib/analyze.functions";
import type { LearningReport } from "@/lib/report-data";
import { cn } from "@/lib/utils";

export const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|v\/)[\w-]{6,}|youtu\.be\/[\w-]{6,})(\S*)?$/i;

function thumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function Compare({ report }: { report: LearningReport }) {
  const analyze = useServerFn(analyzeVideo);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [other, setOther] = useState<LearningReport | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = url.trim();
    if (!t || loading) return;
    if (!YOUTUBE_REGEX.test(t)) {
      toast.error("Please enter a valid YouTube URL.");
      return;
    }
    if (t === report.url) {
      toast.error("Pick a different video to compare.");
      return;
    }
    setLoading(true);
    try {
      const r = await analyze({ data: { url: t } });
      setOther(r);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not analyze that video.");
    } finally {
      setLoading(false);
    }
  };

  if (!other) {
    return (
      <form onSubmit={submit} className="p-5">
        <p className="text-sm text-muted-foreground">
          Paste another YouTube URL to compare against this video.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 transition-colors focus-within:border-primary/50">
            <Youtube className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              placeholder="https://youtube.com/watch?v=…"
              className="w-full bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              aria-label="Second YouTube video URL"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl px-5"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                Compare <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    );
  }

  const scoreDiff = Math.abs(report.overallScore - other.overallScore);
  const isTie = scoreDiff <= 0.2;
  const leftWins = !isTie && report.overallScore > other.overallScore;
  const rightWins = !isTie && other.overallScore > report.overallScore;

  return (
    <div className="p-5">
      <div className="relative grid items-stretch gap-4 sm:grid-cols-2 sm:gap-6">
        <CompareCard report={report} winner={leftWins} />
        <CompareCard report={other} winner={rightWins} />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center sm:flex">
          {isTie ? (
            <div className="relative flex items-center justify-center rounded-full border border-primary/40 bg-card/80 px-3 py-1 text-[10px] font-semibold tracking-wider text-primary backdrop-blur-xl">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <span className="relative">Too close to call</span>
            </div>
          ) : (
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-card/80 text-[11px] font-semibold tracking-wider text-primary backdrop-blur-xl">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <span className="relative">VS</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Button
          onClick={() => {
            setOther(null);
            setUrl("");
          }}
          variant="outline"
          className="h-10 rounded-xl px-5"
        >
          Compare another
        </Button>
      </div>
    </div>
  );
}

export function CompareCard({
  report,
  winner,
}: {
  report: LearningReport;
  winner: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all",
        winner
          ? "border-primary/50 bg-primary/5"
          : "border-border/60 bg-secondary/20",
      )}
      style={winner ? { boxShadow: "var(--shadow-glow)" } : undefined}
    >
      {winner && (
        <span className="absolute left-4 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-background/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary backdrop-blur">
          <Trophy className="h-3 w-3" /> Better pick
        </span>
      )}

      {/* Compact thumbnail, merged into the same card — no separate preview block */}
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-secondary/40">
        <img
          src={thumbnailUrl(report.videoId)}
          alt={report.title}
          className="h-full w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,14,0.85) 0%, rgba(10,10,14,0.35) 45%, transparent 75%)",
          }}
          aria-hidden
        />
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="flex-1">
          <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">
            {report.channel}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold tracking-tight text-foreground">
            {report.title}
          </h3>
          <div className="mt-4 flex items-end gap-2">
            <div className="text-3xl font-semibold tracking-tight">
              {report.overallScore.toFixed(1)}
            </div>
            <div className="pb-1 text-xs text-muted-foreground">/ 10 Quality Score</div>
          </div>
          <div
            className="mt-1 text-lg leading-none"
            title={`Quality score: ${report.overallScore.toFixed(1)} out of 10`}
          >
            {renderBooks(report.overallScore)}
          </div>
          <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {report.executiveSummary}
          </p>
          <a
            href={`/report?url=${encodeURIComponent(report.url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View full report <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat
            label="Worth"
            value={report.worthWatching}
            sublabel={report.category}
          />
          <Stat label="Length" value={`${Math.round(report.durationSec / 60)}m`} />
          <Stat label="Saved" value={`${Math.round(report.timeSavedSec / 60)}m`} />
        </dl>
      </div>
    </motion.div>
  );
}

export function Stat({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
      {sublabel && (
        <div className="mt-0.5 truncate px-1 text-[9px] text-muted-foreground/70">
          {sublabel}
        </div>
      )}
    </div>
  );
}

export function renderBooks(score: number): string {
  // score is 0-10; convert proportionally to a 5-book visual scale
  const full = Math.round((score / 10) * 5);
  return "📚".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
}
