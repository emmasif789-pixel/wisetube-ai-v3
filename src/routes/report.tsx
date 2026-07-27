import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  Dna,
  Gauge,
  GitCompare,
  HelpCircle,
  ListTree,
  Map as MapIcon,
  MessagesSquare,
  Play,
  Sparkles,
  Youtube,
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
import { CircularRing } from "@/components/wistube/circular-ring";
import { ReportCard } from "@/components/wistube/report-card";
import { useListeningMode } from "@/hooks/use-listening-mode";
import { ListenTriggerButton, ListenPanel } from "@/components/wistube/listening-mode";
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
  const [generationTimeSec, setGenerationTimeSec] = useState<number | null>(null);
  const query = useQuery<LearningReport, Error>({
    queryKey: ["report", url],
    queryFn: async () => {
      const t0 = performance.now();
      const result = await analyze({ data: { url: url! } });
      setGenerationTimeSec((performance.now() - t0) / 1000);
      return result;
    },
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
            <Report report={query.data} generationTimeSec={generationTimeSec} />
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </main>
  );
}

const NO_CAPTIONS_MESSAGE = "This video is private, unavailable, or has no transcript.";

const EXAMPLE_VIDEOS = [
  {
    label: "TED Talk: Do Schools Kill Creativity?",
    url: "https://www.youtube.com/watch?v=iG9CE55wbtY",
  },
  {
    label: "Steve Jobs: Stanford Commencement Speech",
    url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
  },
];

function ErrorScreen({ message }: { message: string }) {
  const isNoCaptions = message === NO_CAPTIONS_MESSAGE;

  return (
    <section className="relative pt-40 pb-24 sm:pt-48">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="mx-auto max-w-xl px-6 text-center">
        {isNoCaptions ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-secondary/40">
              <Youtube className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              This video doesn't have captions
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              WisTube currently analyzes videos that include captions or transcripts.
            </p>
            <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Try another video, or use one of these examples
            </p>
            <div className="mt-4 space-y-2">
              {EXAMPLE_VIDEOS.map((v) => (
                <a
                  key={v.url}
                  href={`/report?url=${encodeURIComponent(v.url)}`}
                  className="block rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-secondary/50"
                >
                  {v.label}
                </a>
              ))}
            </div>
            <div className="mt-6">
              <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-5">
                <a href="/">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Try another video
                </a>
              </Button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
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

const VERDICT_META: Record<
  LearningReport["worthWatching"],
  { label: string; dot: string }
> = {
  Yes: { label: "Watch in full", dot: "bg-emerald-500" },
  Skim: { label: "Watch only key sections", dot: "bg-amber-400" },
  No: { label: "Skip it", dot: "bg-red-500" },
};

const DNA_COLOR_MAP: Record<string, string> = {
  "Core Concepts": "bg-blue-500/80",
  Examples: "bg-green-500/80",
  Stories: "bg-[#EC4899]/80",
  Repetition: "bg-amber-400/80",
  "Sponsor/Promotion": "bg-gray-300/80",
  Filler: "bg-red-400/60",
};
function dnaColorClass(label: string): string {
  return DNA_COLOR_MAP[label] ?? "bg-secondary-foreground/40";
}

function Report({
  report,
  generationTimeSec,
}: {
  report: LearningReport;
  generationTimeSec: number | null;
}) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [qualityOpen, setQualityOpen] = useState(true);

  const listenSections = [
    { label: "The Idea", text: report.executiveSummary },
    { label: "Why It Matters", text: report.scoreExplanation },
    {
      label: "Worth Your Time?",
      text:
        report.worthWatching === "Yes"
          ? "Yes — this one earns its runtime."
          : report.worthWatching === "Skim"
            ? "Worth a skim — watch the highlighted sections, skip the rest."
            : "No — the Skip Map below shows why.",
    },
  ];
  const listenState = useListeningMode(listenSections);
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

  const totalMin = Math.max(1, Math.round(report.durationSec / 60));
  const minutesSaved = Math.max(0, Math.round(report.timeSavedSec / 60));
  const minutesToMaster = Math.max(
    1,
    Math.round((report.durationSec - report.timeSavedSec) / 60),
  );
  const savedPct = report.durationSec
    ? Math.min(100, Math.round((report.timeSavedSec / report.durationSec) * 100))
    : 0;

  const verdict = VERDICT_META[report.worthWatching];

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

        {/* Hero — title, compact Time Saved / Verdict / Video DNA at a glance */}
        <ElevatedCard interactive>
          <div className="flex flex-col-reverse gap-6 p-8 lg:flex-row lg:items-start">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Learning Report
              </p>
              <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {report.title}
              </h1>

              {/* Time Saved — the biggest text after the title, first thing the eye sees */}
              <div className="mt-5">
                {minutesSaved > 0 ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Clock className="h-6 w-6 shrink-0 self-center text-primary" />
                    <span className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      Save {minutesSaved} min
                    </span>
                    <span className="text-base font-medium text-muted-foreground">
                      ({totalMin} → {minutesToMaster})
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {savedPct}% faster
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-6 w-6 shrink-0 text-primary" />
                    <span className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      100% Worth Your Time
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", verdict.dot)} />
                  <span className="font-medium text-foreground">Verdict:</span>
                  <span className="text-muted-foreground">{verdict.label}</span>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <Dna className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">Video DNA</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                    {report.videoDna.map((c, i) => (
                      <motion.div
                        key={c.label}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.percentage}%` }}
                        transition={{ duration: 0.55, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className={dnaColorClass(c.label)}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {report.videoDna.map((c, i) => (
                      <motion.span
                        key={c.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.15 + 0.25 }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", dnaColorClass(c.label))} />
                        {c.percentage}% {c.label}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Quality Assessment — collapsed by default, visual only */}
              <div className="mt-4 rounded-xl border border-border/60 bg-secondary/20">
                <button
                  type="button"
                  onClick={() => setQualityOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Gauge className="h-4 w-4 text-primary" />
                    Learning Quality Assessment
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                      qualityOpen && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {qualityOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 px-4 pb-4 pt-1">
                        <div>
                          <span className="text-2xl font-semibold tracking-tight text-foreground">
                            {report.overallScore.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground"> / 10 overall</span>
                        </div>
                        <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4">
                          {report.scoreBreakdown.map((b, i) => (
                            <CircularRing
                              key={b.label}
                              value={(b.score / 10) * 100}
                              size={52}
                              strokeWidth={4.5}
                              centerText={b.score.toFixed(1)}
                              label={b.label}
                              delay={i * 0.06}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge>{report.category}</Badge>
                <Badge>{totalMin} min</Badge>
                <Badge>{report.language}</Badge>
              </div>
            </div>
            <div className="w-full lg:w-2/5">
              <YouTubePlayer ref={playerRef} videoId={report.videoId} />
            </div>
          </div>
        </ElevatedCard>

        {/* Report Card — Spotify-Wrapped-style shareable snapshot */}
        <div className="mt-8">
          <ReportCard report={report} generationTimeSec={generationTimeSec} />
        </div>

        {/* Key Insights — scan it in 30 seconds */}
        <SectionTitle icon={CheckCircle2}>Key Insights</SectionTitle>
        <ElevatedCard>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 p-8 sm:grid-cols-2">
            {report.keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed text-foreground/90">
                  {insight.title}
                </span>
              </li>
            ))}
          </ul>
        </ElevatedCard>

        {/* Executive Summary — learn it in 3-5 minutes, with AI Listening Mode */}
        <div className="mt-12 mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Executive Summary
            </h2>
          </div>
          <ListenTriggerButton state={listenState} />
        </div>
        <ElevatedCard>
          <div className="p-8">
            <div className="grid gap-6 sm:grid-cols-3">
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
            <ListenPanel
              sections={listenSections}
              state={listenState}
              onContinue={() => {
                document
                  .querySelector('[data-section="learning-timeline"]')
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>
        </ElevatedCard>

        {/* Skip Map */}
        <SectionTitle icon={MapIcon}>Skip Map</SectionTitle>
        <ElevatedCard interactive>
          <div className="p-8">
            {/* Stats row */}
            {(() => {
              const watchCount = report.skipMap.filter((s) => s.kind === "watch").length;
              const optionalCount = report.skipMap.filter((s) => s.kind === "optional").length;
              const skipCount = report.skipMap.filter((s) => s.kind === "skip").length;
              return (
                <p className="mb-4 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{report.skipMap.length} Sections</span>
                  {" • "}
                  <span className="text-emerald-500">{watchCount} Watch</span>
                  {" • "}
                  <span className="text-amber-500">{optionalCount} Optional</span>
                  {" • "}
                  <span className="text-red-400">{skipCount} Skip</span>
                  {" • "}
                  <span className="font-medium text-foreground">{minutesSaved} min saved</span>
                </p>
              );
            })()}

            {/* Sticky bar — stays visible while the section cards below scroll */}
            <div className="sticky top-24 z-10 space-y-2 rounded-xl bg-card/95 py-2 backdrop-blur-xl">
              <div className="relative flex h-3 w-full overflow-hidden rounded-full bg-secondary/60">
                {report.skipMap.map((s, i) => {
                  const width = ((s.end - s.start) / report.durationSec) * 100;
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      onClick={() => handleSegmentClick(s.id, s.start)}
                      aria-label={`${s.label} ${formatTimestamp(s.start)} to ${formatTimestamp(s.end)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "relative h-full transition-opacity hover:opacity-100",
                        activeSegment && activeSegment !== s.id
                          ? "opacity-60"
                          : "opacity-100",
                        segmentBgClass(s.kind),
                      )}
                    >
                      {s.isBestMoment && (
                        <span
                          className="absolute inset-0 flex items-center justify-center"
                          aria-hidden
                        >
                          <span className="best-moment-pulse h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_6px_2px_rgba(251,191,36,0.6)]" />
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <style>{`
                @keyframes best-moment-pulse {
                  0%, 100% { opacity: 0.6; transform: scale(1); }
                  50% { opacity: 1; transform: scale(1.4); }
                }
                .best-moment-pulse { animation: best-moment-pulse 2.2s ease-in-out infinite; }
              `}</style>
            </div>

            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {report.skipMap.map((s, i) => {
                const isActive = activeSegment === s.id;
                return (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSegmentClick(s.id, s.start)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border-l-4 bg-secondary/30 p-4 text-left transition-colors hover:bg-secondary/50",
                        segmentBorderClass(s.kind),
                        isActive && "bg-primary/10",
                        s.isBestMoment && "ring-1 ring-amber-400/50",
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {segmentEmoji(s.kind)} {s.label}
                            {s.isBestMoment && (
                              <span className="ml-2 text-xs font-medium text-amber-500">
                                ⭐ Best Moment
                              </span>
                            )}
                          </p>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {formatTimestamp(s.start)} – {formatTimestamp(s.end)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {s.isBestMoment ? "Highest learning value — " : ""}
                          {s.reason}
                        </p>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </ElevatedCard>

        {/* Learning Timeline */}
        <div data-section="learning-timeline">
          <SectionTitle icon={ListTree}>Learning Timeline</SectionTitle>
        </div>
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

        {/* Debate / Different Perspectives — generated asynchronously in the
            background; renders nothing at all if generation fails, so it
            never shows an error state to the user. */}
        <ElevatedCard interactive>
          <Debate report={report} />
        </ElevatedCard>

        {/* Compare Videos — badge + glow border so it doesn't get scrolled past */}
        <SectionTitle icon={GitCompare}>
          Compare Videos
          <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-primary">
            🔥 Try it
          </span>
        </SectionTitle>
        <ElevatedCard interactive glow>
          <Compare report={report} />
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
      </div>
    </section>
  );
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
function segmentBorderClass(kind: SkipSegmentKind): string {
  if (kind === "watch") return "border-l-emerald-500";
  if (kind === "optional") return "border-l-amber-400";
  return "border-l-red-400";
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
  glow = false,
}: {
  children: React.ReactNode;
  interactive?: boolean;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-0 overflow-hidden rounded-[20px] bg-card/60 backdrop-blur-xl",
        interactive && "border border-border/50",
        glow && "border border-primary/40",
      )}
      style={{
        boxShadow: glow
          ? "var(--shadow-glow)"
          : "0 1px 2px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.10)",
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
