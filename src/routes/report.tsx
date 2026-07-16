import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Gauge,
  ListTree,
  Map as MapIcon,
  MessagesSquare,
  Sparkles,
  ThumbsUp,
  Youtube,
} from "lucide-react";
import { z } from "zod";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

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
        {!ready ? (
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
            <Report url={url} />
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

function Report({ url }: { url?: string }) {
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

        {/* Video Header */}
        <Card>
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-secondary/40 sm:w-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <Youtube className="h-10 w-10 text-muted-foreground/70" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary">
                Learning Report
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                How to Learn Anything Faster
              </h1>
              <p className="mt-2 truncate text-sm text-muted-foreground">
                {url ?? "youtube.com/watch?v=example"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge>Education</Badge>
                <Badge>18 min</Badge>
                <Badge>English</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Executive Summary */}
        <SectionTitle icon={Sparkles}>Executive Summary</SectionTitle>
        <Card>
          <div className="space-y-3 p-6">
            <Skeleton className="h-4 w-full bg-secondary/50" />
            <Skeleton className="h-4 w-11/12 bg-secondary/50" />
            <Skeleton className="h-4 w-9/12 bg-secondary/50" />
            <Skeleton className="h-4 w-10/12 bg-secondary/50" />
          </div>
        </Card>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Clock} label="Time Saved" value="12 min" hint="of 18 min video" />
          <StatCard icon={Gauge} label="Learning Score" value="87 / 100" hint="High signal" />
          <StatCard icon={ThumbsUp} label="Worth Watching" value="Yes" hint="Recommended" />
        </div>

        {/* Key Insights */}
        <SectionTitle icon={Sparkles}>Key Insights</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-24 bg-secondary/50" />
                <Skeleton className="h-4 w-full bg-secondary/50" />
                <Skeleton className="h-4 w-10/12 bg-secondary/50" />
              </div>
            </Card>
          ))}
        </div>

        {/* Learning Timeline */}
        <SectionTitle icon={ListTree}>Learning Timeline</SectionTitle>
        <Card>
          <ol className="divide-y divide-border/60">
            {["Introduction", "Core Concept", "Practical Example", "Advanced Tips", "Conclusion"].map(
              (t, i) => (
                <li key={t} className="flex items-center gap-4 p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-secondary/60 text-xs text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{t}</p>
                    <Skeleton className="mt-2 h-3 w-8/12 bg-secondary/50" />
                  </div>
                  <span className="text-xs text-muted-foreground">0{i}:{i * 3 + 12}</span>
                </li>
              ),
            )}
          </ol>
        </Card>

        {/* Skip Map */}
        <SectionTitle icon={MapIcon}>Skip Map</SectionTitle>
        <Card>
          <div className="p-6">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/60">
              <div className="absolute inset-y-0 left-[8%] w-[14%] rounded-full bg-destructive/70" />
              <div className="absolute inset-y-0 left-[34%] w-[22%] rounded-full bg-primary/70" />
              <div className="absolute inset-y-0 left-[62%] w-[10%] rounded-full bg-destructive/70" />
              <div className="absolute inset-y-0 left-[76%] w-[18%] rounded-full bg-primary/70" />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" /> Watch
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" /> Skip
              </span>
            </div>
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