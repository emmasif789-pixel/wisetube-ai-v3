import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ListTree,
  Map as MapIcon,
  MessagesSquare,
  Play,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { z } from "zod";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp, getYouTubeVideoId } from "@/lib/youtube";
import { buildReport, type LearningReport, type SkipSegmentKind } from "@/lib/report-data";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/wistube/youtube-player";
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
  const report = useMemo(
    () => (url && videoId ? buildReport(url, videoId) : null),
    [url, videoId],
  );

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(6);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const total = 2600;
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(98, ((Date.now() - start) / total) * 100);
      setProgress(pct);
    }, 80);
    const msg = setInterval(
      () => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      750,
    );
    const done = setTimeout(() => {
      setProgress(100);
      setReady(true);
    }, total);
    return () => {
      clearInterval(tick);
      clearInterval(msg);
      clearTimeout(done);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <AnimatePresence mode="wait">
        {!ready || !report ? (
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
            <Report report={report} />
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </main>
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
      className={`relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <Skeleton className="absolute inset-0 rounded-2xl bg-secondary/40" />
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

        {/* Video Header with embedded player */}
        <Card>
          <div className="flex flex-col gap-5 p-6 lg:flex-row">
            <div className="w-full lg:w-2/3">
              <YouTubePlayer ref={playerRef} videoId={report.videoId} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary">
                Learning Report
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {report.title}
              </h1>
              <p className="mt-2 truncate text-sm text-muted-foreground">
                {report.channel} · {report.url}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge>{report.category}</Badge>
                <Badge>{Math.round(report.durationSec / 60)} min</Badge>
                <Badge>{report.language}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Executive Summary */}
        <SectionTitle icon={Sparkles}>Executive Summary</SectionTitle>
        <Card>
          <p className="p-6 text-sm leading-relaxed text-foreground/90 sm:text-base">
            {report.executiveSummary}
          </p>
        </Card>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Clock}
            label="Time Saved"
            value={`${Math.round(report.timeSavedSec / 60)} min`}
            hint={`of ${Math.round(report.durationSec / 60)} min video`}
          />
          <StatCard
            icon={BookOpen}
            label="Learning Score"
            value={`${report.overallScore.toFixed(1)} / 5`}
            hint={renderBooks(report.overallScore)}
          />
          <StatCard
            icon={ThumbsUp}
            label="Worth Watching"
            value={report.worthWatching}
            hint={
              report.worthWatching === "Yes"
                ? "Recommended"
                : report.worthWatching === "Skim"
                  ? "Watch selectively"
                  : "Skip it"
            }
          />
        </div>

        {/* Learning Score detail */}
        <SectionTitle icon={BookOpen}>Learning Score</SectionTitle>
        <Card>
          <div className="grid gap-6 p-6 md:grid-cols-2">
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
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {report.scoreExplanation}
              </p>
            </div>
            <ul className="space-y-3">
              {report.scoreBreakdown.map((b) => (
                <li key={b.label} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm text-muted-foreground">
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
              ))}
            </ul>
          </div>
        </Card>

        {/* Key Insights */}
        <SectionTitle icon={Sparkles}>Key Insights</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {report.keyInsights.map((insight, i) => (
            <Card key={i}>
              <div className="space-y-2 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {insight.title}
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {insight.body}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Learning Timeline */}
        <SectionTitle icon={ListTree}>Learning Timeline</SectionTitle>
        <Card>
          <ol ref={timelineRef} className="divide-y divide-border/60">
            {report.chapters.map((c, i) => {
              const isActive = activeChapter === c.id;
              return (
                <li key={c.id} data-chapter={c.id}>
                  <button
                    type="button"
                    onClick={() => handleChapterClick(c.id, c.start)}
                    className={cn(
                      "group flex w-full items-center gap-4 p-5 text-left transition-colors",
                      isActive
                        ? "bg-primary/10"
                        : "hover:bg-secondary/40",
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
        </Card>

        {/* Skip Map */}
        <SectionTitle icon={MapIcon}>Skip Map</SectionTitle>
        <Card>
          <div className="space-y-6 p-6">
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
        </Card>

        {/* Ask AI */}
        <SectionTitle icon={MessagesSquare}>Ask AI</SectionTitle>
        <Card>
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <input
              disabled
              placeholder="Ask any question about this video…"
              className="w-full flex-1 rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button disabled className="h-11 rounded-xl px-5">
              Coming soon
            </Button>
          </div>
        </Card>
      </div>
    </section>
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl"
      style={{ boxShadow: "var(--shadow-card)" }}
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
    <div className="mt-10 mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {children}
      </h2>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}