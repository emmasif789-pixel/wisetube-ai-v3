import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { LearningReport } from "@/lib/report-data";
import { CircularRing } from "./circular-ring";

export function ReportCard({
  report,
  generationTimeSec,
}: {
  report: LearningReport;
  generationTimeSec: number | null;
}) {
  const minutesSaved = Math.max(0, Math.round(report.timeSavedSec / 60));
  const savedPct = report.durationSec
    ? Math.min(100, Math.round((report.timeSavedSec / report.durationSec) * 100))
    : 0;
  const topDna = [...report.videoDna].sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[24px] border border-primary/25 bg-card/40 p-8 backdrop-blur-2xl"
      style={{ boxShadow: "var(--shadow-glow)" }}
    >
      {/* Subtle gradient wash, premium not flashy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "var(--gradient-hero)" }}
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Your Learning Report
          </p>
        </div>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
          {report.title}
        </h3>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:justify-start">
          <CircularRing
            value={(report.overallScore / 10) * 100}
            size={84}
            strokeWidth={7}
            centerText={report.overallScore.toFixed(1)}
            label="Quality Score"
            sublabel="out of 10"
            delay={0.1}
          />
          <CircularRing
            value={savedPct}
            size={64}
            strokeWidth={6}
            centerText={`${savedPct}%`}
            label="Time Saved"
            sublabel={`${minutesSaved} min`}
            delay={0.2}
          />
          {topDna && (
            <CircularRing
              value={topDna.percentage}
              size={64}
              strokeWidth={6}
              centerText={`${topDna.percentage}%`}
              label={topDna.label}
              sublabel="of runtime"
              delay={0.3}
            />
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border/60 bg-secondary/50 px-2.5 py-1">
            {report.category}
          </span>
          <span className="rounded-full border border-border/60 bg-secondary/50 px-2.5 py-1">
            {report.worthWatching === "Yes"
              ? "Watch in full"
              : report.worthWatching === "Skim"
                ? "Watch key sections"
                : "Skip it"}
          </span>
        </div>
      </div>

      {generationTimeSec !== null && (
        <p className="relative mt-6 text-right text-[10px] text-muted-foreground/70">
          Generated in {generationTimeSec.toFixed(1)}s
        </p>
      )}
    </motion.div>
  );
}
