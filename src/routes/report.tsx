import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Eye,
  GitCompare,
  GraduationCap,
  HelpCircle,
  ListTree,
  Map as MapIcon,
  MessagesSquare,
  Play,
  Sparkles,
  Star,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import { z } from "zod";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp, getYouTubeVideoId } from "@/lib/youtube";
import { type LearningReport, type SkipSegmentKind } from "@/lib/report-data";
import { analyzeVideo } from "@/lib/analyze.functions";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/wistube/youtube-player";
import { AskAi } from "@/components/wistube/ask-ai";
import { Quiz } from "@/components/wistube/quiz";
import { Compare } from "@/components/wistube/compare";
import { Debate } from "@/components/wistube/debate";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ url: z.string().optional() });

export const Route = createFileRoute("/report")({
  validateSearch: (s) => searchSchema.parse(s),
  component: ReportPage,
});

const LOADING_MESSAGES = [
  "Reading transcript...",
  "Understanding key concepts...",
  "Calculating learning score...",
  "Building your learning report...",
];

function ReportPage() {
  const { url } = Route.useSearch();
  const videoId = useMemo(() => (url ? getYouTubeVideoId(url) : null), [url]);
  const analyze = useServerFn(analyzeVideo);
  const query = useQuery<LearningReport, Error>({
    queryKey: ["report", url],
    queryFn: () => analyze({ data: { url: url! } }),
    enabled: Boolean(url && videoId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const [progress, setProgress] = useState(6);
  const [msgIndex, setMsgIndex] = useState(0);
  const loading = query.isLoading || query.isFetching;
  const ready = query.isSuccess && !!query.data;

  useEffect(() => {
    if (!loading) {
      setProgress(100);
      return;
    }
    const start = Date.now();
    const tick = setInterval(() => {
      const t = (Date.now() - start) / 20000;
      setProgress(Math.min(95, 6 + (1 - Math.exp(-t * 2)) * 90));
    }, 120);
    const msg = setInterval(
      () => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      1200,
    );
    return () => {
      clearInterval(tick);
      clearInterval(msg);
    };
  }, [loading]);

  useEffect(() => {
    if (query.isError && query.error) {
      toast.error(query.error.message || "Something went wrong analyzing this video.");
    }
  }, [query.isError, query.error]);

  const errorMessage = !url
    ? "No video URL provided."
    : !videoId
      ? "That doesn't look like a valid YouTube URL."
      : query.error?.message ?? null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <AnimatePresence mode="wait">
        {query.isError || (!url || !videoId) ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorScreen message={errorMessage ?? "Something went wrong."} />
          </motion.div>
        ) : !ready || !query.data ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LoadingScreen message={LOADING_MESSAGES[msgIndex]} progress={progress} />
          </motion.div>
        ) : (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Report report={query.data} />
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </main>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <section className="relative pt-40 pb-24 sm:pt-48">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="mx-auto max-w-xl px-6 text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          We couldn't analyze this video
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6">
          <Button asChild size="lg" className="h-11 rounded-xl px-5">
            <a href="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Try another video
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function LoadingScreen({ message, progress }: { message: string; progress: number }) {
  return (
    <section className="relative pt-40 pb-24 sm:pt-48">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            Generating your Learning Report
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              {message}
            </span>
          </h1>
          <div className="mx-auto mt-8 max-w-md">
            <Progress value={progress} className="h-1.5" />
            <p className="mt-2 text-xs text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        <div className="mt-14 space-y-4">
          <ShimmerCard className="h-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ShimmerCard className="h-28" />
            <ShimmerCard className="h-28" />
            <ShimmerCard className="h-28" />
          </div>
          <ShimmerCard className="h-56" />
        </div>
      </div>
    </section>
  );
}

function ShimmerCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] bg-card/60 backdrop-blur-xl ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <Skeleton className="absolute inset-0 rounded-[20px] bg-secondary/40" />
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.06), transparent)",
        }}
      />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

function Report({ report }: { report: LearningReport }) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const timelineRef = useRef<HTMLOListElement>(null);

  const jumpTo = (seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  };

  const handleChapterClick = (chapterId: string, start: number) => {
    setActiveChapter(chapterId);
    jumpTo(start);
    const el = timelineRef.current?.querySelector<HTMLElement>(
      `[data-chapter="${chapterId}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleSegmentClick = (segmentId: string, start: number) => {
    setActiveSegment(segmentId);
    jumpTo(start);
  };

  const minutesSaved = Math.max(0, Math.round(report.timeSavedSec / 60));
  const minutesToMaster = Math.max(
    1,
    Math.round((report.durationSec - report.timeSavedSec) / 60),
  );
  const savedPct = report.durationSec
    ? Math.min(100, Math.round((report.timeSavedSec / report.durationSec) * 100))
    : 0;

  return (
    <section className="relative pt-32 pb-24 sm:pt-40">
      <div className="mx-auto max-w-5xl px-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          asChild
        >
          <a href="/">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </a>
        </Button>

        {/* Outcome-first hero */}
        <ElevatedCard interactive>
          <div className="flex flex-col-reverse gap-6 p-8 lg:flex-row lg:items-center">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Learning Report
              </p>
              <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                Master this video in {minutesToMaster} min
              </h1>
              <p className="mt-2 truncate text-[18px] font-medium text-muted-foreground/70">
                {report.title}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="min-w-[160px] flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Time Saved
                    </span>
                    <span className="font-medium text-foreground">
                      {minutesSaved > 0
                        ? `${minutesSaved} min`
                        : "Every second pulls its weight"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all"
                      style={{ width: `${minutesSaved > 0 ? savedPct : 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.round(report.overallScore)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                  <span className="ml-1.5 text-sm font-medium text-foreground">
                    {report.overallScore.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge>{report.category}</Badge>
                <Badge>{Math.round(report.durationSec / 60)} min</Badge>
                <Badge>{report.language}</Badge>
                <Badge>
                  {report.worthWatching === "Yes"
                    ? "Recommended"
                    : report.worthWatching === "Skim"
                      ? "Watch selectively"
                      : "Skip it"}
                </Badge>
              </div>
            </div>
            <div className="w-full lg:w-2/5">
              <YouTubePlayer ref={playerRef} videoId={report.videoId} />
            </div>
          </div>
        </ElevatedCard>

        {/* Executive Summary — split into scannable subsections */}
        <SectionTitle icon={Sparkles}>Executive Summary</SectionTitle>
        <ElevatedCard>
          <div className="grid gap-6 p-8 sm:grid-cols-3">
            <SummaryBlock label="The Idea" text={report.executiveSummary} onJump={jumpTo} />
            <SummaryBlock label="Why It Matters" text={report.scoreExplanation} onJump={jumpTo} />
            <SummaryBlock
              label="Worth Your Time?"
              onJump={jumpTo}
              text={
                report.worthWatching === "Yes"
                  ? "Yes — this one earns its runtime."
                  : report.worthWatching === "Skim"
                    ? "Worth a skim — watch the highlighted sections, skip the rest."
                    : "No — the Skip Map below shows why."
              }
            />
          </div>
        </ElevatedCard>

        {/* AI Debate — generated asynchronously in the background; renders
            nothing at all if generation fails, so it never shows an error
            state to the user. */}
        <ElevatedCard interactive>
          <Debate report={report} />
        </ElevatedCard>

        {/* Learning Score detail */}
        <SectionTitle icon={BookOpen}>Learning Score</SectionTitle>
        <ElevatedCard>
          <div className="grid gap-6 p-8 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Overall Learning Score
              </p>
              <div className="mt-2 text-4xl font-semibold tracking-tight">
                {report.overallScore.toFixed(1)}{" "}
                <span className="text-lg text-muted-foreground">/ 5</span>
              </div>
              <div className="mt-2 text-2xl leading-none">
                {renderBooks(report.overallScore)}
              </div>
            </div>
            <ul className="space-y-4">
              {report.scoreBreakdown.map((b) => {
                const Icon = metricIcon(b.label);
                return (
                  <li key={b.label} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="w-32 shrink-0 text-sm text-muted-foreground">
                      {b.label}
                    </span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary/60">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary/80"
                        style={{ width: `${(b.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm tabular-nums text-foreground">
                      {b.score.toFixed(1)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </ElevatedCard>

        {/* Key Insights */}
        <SectionTitle icon={Sparkles}>Key Insights</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {report.keyInsights.map((insight, i) => (
            <ElevatedCard key={i}>
              <div className="space-y-2 p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {insight.title}
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">
                  <TextWithTimestamps text={insight.body} onJump={jumpTo} />
                </p>
              </div>
            </ElevatedCard>
          ))}
        </div>

        {/* Learning Timeline */}
        <SectionTitle icon={ListTree}>Learning Timeline</SectionTitle>
        <ElevatedCard interactive>
          <ol ref={timelineRef} className="divide-y divide-border/40">
            {report.chapters.map((c, i) => {
              const isActive = activeChapter === c.id;
              return (
                <li key={c.id} data-chapter={c.id}>
                  <button
                    type="button"
                    onClick={() => handleChapterClick(c.id, c.start)}
                    className={cn(
                      "group flex w-full items-center gap-4 border-l-2 p-5 text-left transition-all",
                      isActive
                        ? "border-l-primary bg-primary/10"
                        : "border-l-transparent hover:border-l-primary/50 hover:bg-secondary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs transition-colors",
                        isActive
                          ? "border-primary/60 bg-primary/20 text-primary"
                          : "border-border/70 bg-secondary/60 text-primary group-hover:border-primary/40",
                      )}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {String(i + 1).padStart(2, "0")} · {c.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.summary}
                      </p>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatTimestamp(c.start)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </ElevatedCard>

        {/* Skip Map */}
        <SectionTitle icon={MapIcon}>Skip Map</SectionTitle>
        <ElevatedCard interactive>
          <div className="space-y-6 p-8">
            <div className="relative flex h-3 w-full overflow-hidden rounded-full bg-secondary/60">
              {report.skipMap.map((s) => {
                const width = ((s.end - s.start) / report.durationSec) * 100;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSegmentClick(s.id, s.start)}
                    aria-label={`${s.label} ${formatTimestamp(s.start)} to ${formatTimestamp(s.end)}`}
                    className={cn(
                      "h-full transition-opacity hover:opacity-100",
                      activeSegment && activeSegment !== s.id
                        ? "opacity-60"
                        : "opacity-100",
                      segmentBgClass(s.kind),
                    )}
                    style={{ width: `${width}%` }}
                  />
                );
              })}
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {report.skipMap.map((s) => {
                const isActive = activeSegment === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => handleSegmentClick(s.id, s.start)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                        isActive
                          ? "border-primary/60 bg-primary/10"
                          : "border-border/60 bg-secondary/30 hover:bg-secondary/50",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                          segmentDotClass(s.kind),
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {segmentEmoji(s.kind)} {s.label}
                          </p>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {formatTimestamp(s.start)} – {formatTimestamp(s.end)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {s.reason}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </ElevatedCard>

        {/* Ask AI */}
        <SectionTitle icon={MessagesSquare}>Ask AI</SectionTitle>
        <ElevatedCard interactive>
          <AskAi report={report} />
        </ElevatedCard>

        {/* Quiz */}
        <SectionTitle icon={HelpCircle}>Test Your Knowledge</SectionTitle>
        <ElevatedCard interactive>
          <Quiz report={report} />
        </ElevatedCard>

        {/* Compare */}
        <SectionTitle icon={GitCompare}>Compare Videos</SectionTitle>
        <ElevatedCard interactive>
          <Compare report={report} />
        </ElevatedCard>
      </div>
    </section>
  );
}

function metricIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("depth")) return BookOpen;
  if (l.includes("clarity")) return Eye;
  if (l.includes("accuracy")) return CheckCircle;
  if (l.includes("structure")) return ListTree;
  if (l.includes("practical")) return Wrench;
  if (l.includes("beginner")) return GraduationCap;
  return BookOpen;
}

function TextWithTimestamps({
  text,
  onJump,
}: {
  text: string;
  onJump: (seconds: number) => void;
}) {
  const parts = text.split(/(\b\d{1,3}:[0-5]\d\b)/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = /^(\d{1,3}):([0-5]\d)$/.exec(part);
        if (!match) return <span key={i}>{part}</span>;
        const seconds = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onJump(seconds)}
            className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
          >
            {part}
          </button>
        );
      })}
    </>
  );
}

function SummaryBlock({
  label,
  text,
  onJump,
}: {
  label: string;
  text: string;
  onJump: (seconds: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">
        <TextWithTimestamps text={text} onJump={onJump} />
      </p>
    </div>
  );
}

function renderBooks(score: number): string {
  const full = Math.round(score);
  return "📚".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
}

function segmentBgClass(kind: SkipSegmentKind): string {
  if (kind === "watch") return "bg-emerald-500/80";
  if (kind === "optional") return "bg-amber-400/80";
  return "bg-red-500/80";
}
function segmentDotClass(kind: SkipSegmentKind): string {
  if (kind === "watch") return "bg-emerald-500";
  if (kind === "optional") return "bg-amber-400";
  return "bg-red-500";
}
function segmentEmoji(kind: SkipSegmentKind): string {
  if (kind === "watch") return "🟢";
  if (kind === "optional") return "🟡";
  return "🔴";
}

/**
 * Static content cards separate via spacing + shadow, not borders.
 * Interactive cards (video, timeline, skip map, ask ai, quiz, compare) keep a
 * subtle border so they still read as clickable/engageable.
 */
function ElevatedCard({
  children,
  interactive = false,
}: {
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-0 overflow-hidden rounded-[20px] bg-card/60 backdrop-blur-xl",
        interactive && "border border-border/50",
      )}
      style={{
        boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.10)",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-12 mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {children}
      </h2>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}
