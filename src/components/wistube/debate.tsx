import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Scale, Split, Sparkles, Wrench } from "lucide-react";
import { generateDebate, type DebateResult } from "@/lib/debate.functions";
import type { LearningReport } from "@/lib/report-data";
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

  return (
    <div className="p-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-xl p-4 text-left transition-colors hover:bg-secondary/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-gradient-to-br from-secondary to-secondary/50">
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
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

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
                  />
                  <DebateSection
                    icon={Split}
                    label="Counterargument"
                    accent="blue"
                    points={result.counterargument}
                  />
                  <ConclusionSection
                    label="Balanced Conclusion"
                    text={result.balancedConclusion}
                  />
                </>
              ) : (
                <>
                  <DebateSection
                    icon={Wrench}
                    label="Primary Approach"
                    accent="emerald"
                    points={result.primaryApproach}
                  />
                  <DebateSection
                    icon={Split}
                    label="Alternative Approaches"
                    accent="blue"
                    points={result.alternativeApproaches}
                  />
                  <ConclusionSection
                    label="Recommendation"
                    text={result.recommendation}
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

const accentClasses: Record<string, { dot: string; border: string }> = {
  emerald: { dot: "bg-emerald-500", border: "hover:border-emerald-500/40" },
  blue: { dot: "bg-blue-500", border: "hover:border-blue-500/40" },
};

function DebateSection({
  icon: Icon,
  label,
  accent,
  points,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  accent: "emerald" | "blue";
  points: string[];
}) {
  const a = accentClasses[accent];
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-secondary/30 p-4 transition-colors",
        a.border,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {label}
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", a.dot)} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConclusionSection({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-4">
      <div className="flex items-center gap-2">
        <Scale className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {label}
        </p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
