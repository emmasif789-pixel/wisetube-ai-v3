import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Scale, Split, Sparkles, Wrench } from "lucide-react";
import { generateDebate, type DebateResult } from "@/lib/debate.functions";
import type { LearningReport } from "@/lib/report-data";
import { CopyButton } from "@/components/wistube/copy-button";
import { cn } from "@/lib/utils";

export function Debate({ report }: { report: LearningReport }) {
  const gen = useServerFn(generateDebate);
  const [result, setResult] = useState<DebateResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(true);

  // Generate in the background once the main report is ready — never blocks
  // or slows the initial Learning Report render. If it fails, we simply
  // don't render the card at all rather than surfacing an error.
  useEffect(() => {
    let cancelled = false;
    gen({
      data: {
        context: {
          title: report.title,
          category: report.category,
          executiveSummary: report.executiveSummary,
          keyInsights: report.keyInsights,
        },
      },
    })
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.videoId]);

  if (failed || !result) return null;

  const isDebate = result.mode === "debate";

  const getCopyText = () => {
    if (isDebate) {
      return [
        "Main Viewpoint:",
        ...result.mainViewpoint.map((p) => `• ${p}`),
        "",
        "Counterargument:",
        ...result.counterargument.map((p) => `• ${p}`),
        "",
        "Balanced Conclusion:",
        result.balancedConclusion,
      ].join("\n");
    }
    return [
      "Primary Approach:",
      ...result.primaryApproach.map((p) => `• ${p}`),
      "",
      "Alternative Approaches:",
      ...result.alternativeApproaches.map((p) => `• ${p}`),
      "",
      "Recommendation:",
      result.recommendation,
    ].join("\n");
  };

  return (
    <div className="p-2">
      <div className="flex w-full items-center justify-between gap-3 rounded-xl p-4 transition-colors hover:bg-secondary/40">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5">
            <Scale className="h-4 w-4 text-primary" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isDebate ? "AI Debate" : "Alternative Approaches"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isDebate
                ? "Explore multiple perspectives to deepen your understanding."
                : "Compare other valid ways to approach the same goal."}
            </p>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <CopyButton getText={getCopyText} />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse" : "Expand"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-300",
                open && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 p-4 pt-2 sm:grid-cols-3">
              {isDebate ? (
                <>
                  <DebateSection
                    icon={Sparkles}
                    label="Main Viewpoint"
                    accent="emerald"
                    points={result.mainViewpoint}
                    delay={0}
                  />
                  <DebateSection
                    icon={Split}
                    label="Counterargument"
                    accent="amber"
                    points={result.counterargument}
                    delay={0.08}
                  />
                  <ConclusionSection
                    label="Balanced Conclusion"
                    text={result.balancedConclusion}
                    delay={0.16}
                  />
                </>
              ) : (
                <>
                  <DebateSection
                    icon={Wrench}
                    label="Primary Approach"
                    accent="emerald"
                    points={result.primaryApproach}
                    delay={0}
                  />
                  <DebateSection
                    icon={Split}
                    label="Alternative Approaches"
                    accent="amber"
                    points={result.alternativeApproaches}
                    delay={0.08}
                  />
                  <ConclusionSection
                    label="Recommendation"
                    text={result.recommendation}
                    delay={0.16}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const accentClasses: Record<
  string,
  { dot: string; border: string; iconBg: string; iconText: string; topBar: string }
> = {
  emerald: {
    dot: "bg-emerald-500",
    border: "border-emerald-500/25 hover:border-emerald-500/50",
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-500",
    topBar: "bg-emerald-500",
  },
  amber: {
    dot: "bg-amber-400",
    border: "border-amber-400/25 hover:border-amber-400/50",
    iconBg: "bg-amber-400/15",
    iconText: "text-amber-500",
    topBar: "bg-amber-400",
  },
};

function DebateSection({
  icon: Icon,
  label,
  accent,
  points,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  accent: "emerald" | "amber";
  points: string[];
  delay?: number;
}) {
  const a = accentClasses[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-secondary/30 p-4 transition-colors",
        a.border,
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-0.5", a.topBar)} aria-hidden />
      <div className="flex items-center gap-2">
        <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", a.iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", a.iconText)} strokeWidth={2.2} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {label}
        </p>
      </div>
      <ul className="mt-3 space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", a.dot)} />
            {p}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ConclusionSection({
  label,
  text,
  delay = 0,
}: {
  label: string;
  text: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/[0.06] p-4"
      style={{ boxShadow: "var(--shadow-glow)" }}
    >
      <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden />
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
          <Scale className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {label}
        </p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-foreground/80">{text}</p>
    </motion.div>
  );
}
