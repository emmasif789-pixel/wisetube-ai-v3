import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Trophy, Youtube } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Aurora } from "@/components/wistube/aurora";
import { Button } from "@/components/ui/button";
import { analyzeVideo } from "@/lib/analyze.functions";
import type { LearningReport } from "@/lib/report-data";
import { CompareCard, YOUTUBE_REGEX } from "@/components/wistube/compare";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

// Plain, deterministic recommendation sentence computed from data already
// on hand — no extra AI call, zero added token/latency cost.
function buildRecommendation(a: LearningReport, b: LearningReport): string {
  const diff = Math.abs(a.overallScore - b.overallScore);
  if (diff <= 0.2) {
    return `These are close in quality (${a.overallScore.toFixed(1)} vs ${b.overallScore.toFixed(1)}) — pick based on which topic or length fits what you need right now.`;
  }
  const winner = a.overallScore > b.overallScore ? a : b;
  const loser = a.overallScore > b.overallScore ? b : a;
  const timeSavedMin = Math.round(winner.timeSavedSec / 60);
  return `${winner.title} is the better learning investment — it scores ${winner.overallScore.toFixed(1)} vs ${loser.overallScore.toFixed(1)}, and its Skip Map alone saves you ${timeSavedMin} min over the other video.`;
}

function ComparePage() {
  const analyze = useServerFn(analyzeVideo);
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportA, setReportA] = useState<LearningReport | null>(null);
  const [reportB, setReportB] = useState<LearningReport | null>(null);

  const bothReady = !!reportA && !!reportB;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = urlA.trim();
    const b = urlB.trim();
    if (!a || !b || loading) return;
    if (!YOUTUBE_REGEX.test(a) || !YOUTUBE_REGEX.test(b)) {
      toast.error("Please enter two valid YouTube URLs.");
      return;
    }
    if (a === b) {
      toast.error("Pick two different videos to compare.");
      return;
    }
    setLoading(true);
    try {
      const [ra, rb] = await Promise.all([
        analyze({ data: { url: a } }),
        analyze({ data: { url: b } }),
      ]);
      setReportA(ra);
      setReportB(rb);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not analyze one of the videos.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setReportA(null);
    setReportB(null);
    setUrlA("");
    setUrlB("");
  };

  const scoreDiff = bothReady ? Math.abs(reportA!.overallScore - reportB!.overallScore) : 0;
  const isTie = scoreDiff <= 0.2;
  const aWins = bothReady && !isTie && reportA!.overallScore > reportB!.overallScore;
  const bWins = bothReady && !isTie && reportB!.overallScore > reportA!.overallScore;

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      <Navbar />
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

          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary backdrop-blur">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Compare
            </p>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-text)" }}
              >
                Compare
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              Analyze two videos side by side and discover which is worth your time.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!bothReady ? (
              <motion.form
                key="inputs"
                onSubmit={submit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6"
              >
                <VideoInputCard
                  label="Video A"
                  value={urlA}
                  onChange={setUrlA}
                  disabled={loading}
                />
                <VideoInputCard
                  label="Video B"
                  value={urlB}
                  onChange={setUrlB}
                  disabled={loading}
                />
                <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center sm:flex">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-card/90 text-xs font-semibold tracking-wider text-primary shadow-[var(--shadow-glow)] backdrop-blur-xl">
                    VS
                  </div>
                </div>
                <div className="sm:col-span-2 flex justify-center">
                  <Button
                    type="submit"
                    disabled={loading || !urlA.trim() || !urlB.trim()}
                    size="lg"
                    className="mt-2 h-12 rounded-xl px-8"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing both videos…
                      </>
                    ) : (
                      "Compare"
                    )}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-12"
              >
                {/* Recommendation — computed from existing scores, no extra AI call.
                    Shown above the cards so the verdict is the first thing seen. */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/[0.05] p-6"
                  style={{ boxShadow: "var(--shadow-glow)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        🏆 WiseTube Recommendation
                      </p>
                      <p className="mt-1.5 text-base font-semibold leading-relaxed text-foreground">
                        {buildRecommendation(reportA!, reportB!)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Single merged card per video — thumbnail, score, and stats
                    all in one place. No separate preview block anymore. */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="relative mt-6 grid items-stretch gap-4 sm:grid-cols-2 sm:gap-6"
                >
                  <CompareCard report={reportA!} winner={aWins} />
                  <CompareCard report={reportB!} winner={bWins} />
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
                </motion.div>

                <div className="mt-8 flex justify-center">
                  <Button onClick={reset} variant="outline" className="h-11 rounded-xl px-6">
                    Compare two new videos
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function VideoInputCard({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div
      className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</p>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 transition-colors focus-within:border-primary/50">
        <Youtube className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://youtube.com/watch?v=…"
          className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          aria-label={`${label} YouTube URL`}
        />
      </div>
    </div>
  );
}
