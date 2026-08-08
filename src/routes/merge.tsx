import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  GitMerge,
  Loader2,
  Plus,
  X,
  Youtube,
  Pin,
  Handshake,
  Swords,
  Star,
  Map as MapIcon,
  ListChecks,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Aurora } from "@/components/wistube/aurora";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/wistube/copy-button";
import { analyzeVideo } from "@/lib/analyze.functions";
import { mergeReports, type MergedReport } from "@/lib/merge.functions";
import { YOUTUBE_REGEX } from "@/components/wistube/compare";

export const Route = createFileRoute("/merge")({
  component: MergePage,
});

const MIN_VIDEOS = 2;
const MAX_VIDEOS = 5;

function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.round((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function buildCopyText(report: MergedReport): string {
  const lines: string[] = [];
  lines.push("WISETUBE AI — MERGED LEARNING GUIDE");
  lines.push(`${report.videoCount} videos merged`);
  lines.push("");
  lines.push("OVERALL SUMMARY");
  lines.push(report.overallSummary);
  lines.push("");
  lines.push("COMMON INSIGHTS");
  report.commonInsights.forEach((c) => lines.push(`- ${c}`));
  if (report.differentOpinions.length) {
    lines.push("");
    lines.push("DIFFERENT OPINIONS");
    report.differentOpinions.forEach((d) => {
      lines.push(`${d.topic}:`);
      d.viewpoints.forEach((v) => lines.push(`  - ${v.source}: ${v.view}`));
    });
  }
  lines.push("");
  lines.push("BEST INSIGHT FROM EACH VIDEO");
  report.bestPerVideo.forEach((b) => lines.push(`- ${b.videoTitle}: ${b.insight} (${b.videoUrl})`));
  lines.push("");
  lines.push("COMBINED LEARNING ROADMAP");
  report.roadmap.forEach((r) => lines.push(`${r.order}. ${r.videoTitle} — ${r.reason}`));
  lines.push("");
  lines.push("ACTION PLAN");
  report.actionPlan.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
  lines.push("");
  lines.push(`TOTAL TIME SAVED: ${formatDuration(report.totalTimeSavedSec)}`);
  return lines.join("\n");
}

function MergePage() {
  const analyze = useServerFn(analyzeVideo);
  const merge = useServerFn(mergeReports);

  const [urls, setUrls] = useState<string[]>(["", ""]);
  const [stage, setStage] = useState<"idle" | "analyzing" | "merging">("idle");
  const [result, setResult] = useState<MergedReport | null>(null);

  const loading = stage !== "idle";

  const updateUrl = (i: number, v: string) => {
    setUrls((prev) => prev.map((u, idx) => (idx === i ? v : u)));
  };
  const addUrl = () => {
    if (urls.length >= MAX_VIDEOS) return;
    setUrls((prev) => [...prev, ""]);
  };
  const removeUrl = (i: number) => {
    if (urls.length <= MIN_VIDEOS) return;
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urls.map((u) => u.trim()).filter(Boolean);
    if (trimmed.length < MIN_VIDEOS) {
      toast.error(`Add at least ${MIN_VIDEOS} video URLs.`);
      return;
    }
    for (const u of trimmed) {
      if (!YOUTUBE_REGEX.test(u)) {
        toast.error("One of those doesn't look like a valid YouTube URL.");
        return;
      }
    }
    if (new Set(trimmed).size !== trimmed.length) {
      toast.error("Please use different videos — duplicates were found.");
      return;
    }

    try {
      setStage("analyzing");
      const reports = await Promise.all(trimmed.map((u) => analyze({ data: { url: u } })));
      setStage("merging");
      const merged = await merge({
        data: {
          reports: reports.map((r) => ({
            url: r.url,
            title: r.title,
            channel: r.channel,
            category: r.category,
            overallScore: r.overallScore,
            timeSavedSec: r.timeSavedSec,
            durationSec: r.durationSec,
            executiveSummary: r.executiveSummary,
            keyInsights: r.keyInsights,
            chapters: r.chapters.map((c) => ({ title: c.title })),
          })),
        },
      });
      setResult(merged);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not merge these videos.");
    } finally {
      setStage("idle");
    }
  };

  const reset = () => {
    setResult(null);
    setUrls(["", ""]);
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      <Navbar />
      <section className="relative pt-32 pb-24 sm:pt-40">
        <div className="mx-auto max-w-4xl px-6">
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
              <GitMerge className="h-3 w-3" />
              Merge
            </p>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-text)" }}
              >
                One Brain
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              Paste 2–5 videos on the same topic. WiseTube merges them into one unified guide —
              no repeats, no contradictions left unresolved.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.form
                key="inputs"
                onSubmit={submit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-12"
              >
                <div
                  className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex flex-col gap-3">
                    {urls.map((u, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 transition-colors focus-within:border-primary/50">
                          <Youtube className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input
                            value={u}
                            onChange={(e) => updateUrl(i, e.target.value)}
                            disabled={loading}
                            placeholder={`Video ${i + 1} URL — https://youtube.com/watch?v=…`}
                            className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            aria-label={`Video ${i + 1} YouTube URL`}
                          />
                        </div>
                        {urls.length > MIN_VIDEOS && (
                          <button
                            type="button"
                            onClick={() => removeUrl(i)}
                            disabled={loading}
                            aria-label={`Remove video ${i + 1}`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground disabled:opacity-40"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {urls.length < MAX_VIDEOS && (
                    <button
                      type="button"
                      onClick={addUrl}
                      disabled={loading}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add another video
                      <span className="text-muted-foreground">
                        ({urls.length}/{MAX_VIDEOS})
                      </span>
                    </button>
                  )}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="h-12 rounded-xl px-8"
                  >
                    {stage === "analyzing" && (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing each video…
                      </>
                    )}
                    {stage === "merging" && (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Merging into one guide…
                      </>
                    )}
                    {stage === "idle" && (
                      <>
                        <GitMerge className="mr-2 h-4 w-4" /> Merge Videos
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-12"
              >
                <MergedReportView report={result} />

                <div className="mt-8 flex justify-center">
                  <Button onClick={reset} variant="outline" className="h-11 rounded-xl px-6">
                    Merge different videos
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

function SectionCard({
  icon: Icon,
  title,
  right,
  delay,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  right?: React.ReactNode;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h2>
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

function MergedReportView({ report }: { report: MergedReport }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/[0.05] p-6"
        style={{ boxShadow: "var(--shadow-glow)" }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
          <Stat label="Videos Merged" value={String(report.videoCount)} />
          <Stat label="Total Runtime" value={formatDuration(report.totalDurationSec)} />
          <Stat
            label="Time Saved"
            value={formatDuration(report.totalTimeSavedSec)}
            highlight
          />
        </div>
      </motion.div>

      {/* Overall Summary */}
      <SectionCard icon={Pin} title="Overall Summary" delay={0.05}>
        <p className="text-sm leading-relaxed text-muted-foreground">{report.overallSummary}</p>
      </SectionCard>

      {/* Common Insights */}
      <SectionCard icon={Handshake} title="Common Insights" delay={0.1}>
        <ul className="flex flex-col gap-2.5">
          {report.commonInsights.map((c, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {c}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Different Opinions */}
      {report.differentOpinions.length > 0 && (
        <SectionCard icon={Swords} title="Different Opinions" delay={0.15}>
          <div className="flex flex-col gap-4">
            {report.differentOpinions.map((d, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-sm font-semibold text-foreground">{d.topic}</p>
                <div className="mt-2.5 flex flex-col gap-2">
                  {d.viewpoints.map((v, j) => (
                    <div key={j} className="flex gap-2 text-sm">
                      <span className="shrink-0 font-medium text-primary">{v.source}:</span>
                      <span className="text-muted-foreground">{v.view}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Best Insight per Video */}
      <SectionCard icon={Star} title="Best Insight from Each Video" delay={0.2}>
        <div className="flex flex-col gap-3">
          {report.bestPerVideo.map((b, i) => (
            <a
              key={i}
              href={b.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{b.videoTitle}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.insight}</p>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary" />
            </a>
          ))}
        </div>
      </SectionCard>

      {/* Roadmap */}
      <SectionCard icon={MapIcon} title="Combined Learning Roadmap" delay={0.25}>
        <ol className="flex flex-col gap-3">
          {report.roadmap.map((r) => (
            <li key={r.order} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                {r.order}
              </span>
              <div className="min-w-0">
                <a
                  href={r.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {r.videoTitle}
                </a>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{r.reason}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>

      {/* Action Plan */}
      <SectionCard icon={ListChecks} title="Action Plan" delay={0.3}>
        <ul className="flex flex-col gap-2.5">
          {report.actionPlan.map((a, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary/40 text-[10px] font-semibold text-primary">
                {i + 1}
              </span>
              {a}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Sources + Export */}
      <SectionCard
        icon={Clock}
        title="Sources & Export"
        delay={0.35}
        right={<CopyButton getText={() => buildCopyText(report)} />}
      >
        <div className="flex flex-wrap gap-2">
          {report.sourceVideos.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Youtube className="h-3 w-3" />
              <span className="max-w-[160px] truncate">{s.title}</span>
              <span className="text-primary">{s.overallScore.toFixed(1)}</span>
            </a>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p
        className={
          highlight
            ? "text-2xl font-bold text-primary"
            : "text-2xl font-bold text-foreground"
        }
      >
        {value}
      </p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
