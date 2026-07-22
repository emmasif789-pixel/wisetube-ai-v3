import { createFileRoute } from "@tanstack/react-router";
import { buildReport } from "@/lib/report-data";
import { AskAi } from "@/components/wistube/ask-ai";
import { Quiz } from "@/components/wistube/quiz";
import { Compare } from "@/components/wistube/compare";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/test-ui")({
  component: TestUiPage,
});

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl",
        className,
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}

function makeReport(videoId: string, title?: string) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const r = buildReport(url, videoId);
  return title ? { ...r, title } : r;
}

function TestUiPage() {
  const report = makeReport("dQw4w9WgXcQ");
  const reportShortTitle = makeReport(
    "short",
    "How to Learn Faster",
  );
  const reportLongTitle = makeReport(
    "longlonglong",
    "A Deep and Comprehensive Exploration of the Science Behind Learning Complex Topics Faster",
  );
  // Force same score for tie test
  const reportTie = { ...reportShortTitle, overallScore: reportLongTitle.overallScore };

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-5xl space-y-10">
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Executive Summary (h-auto)
          </h2>
          <Card className="h-auto">
            <p className="p-6 text-sm leading-relaxed text-foreground/90 sm:text-base">
              {report.executiveSummary}
            </p>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Ask AI Empty State
          </h2>
          <Card>
            <AskAi report={report} />
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Quiz Empty State
          </h2>
          <Card>
            <Quiz report={report} />
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Compare (different scores)
          </h2>
          <Card>
            <Compare report={reportShortTitle} />
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Compare (tie)
          </h2>
          <Card>
            <Compare report={reportTie} />
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            CompareCard Render (different scores + alignment)
          </h2>
          <div className="relative grid items-stretch gap-4 sm:grid-cols-2 sm:gap-6">
            <CompareCard report={reportShortTitle} winner={true} />
            <CompareCard report={reportLongTitle} winner={false} />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center sm:flex">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-card/80 text-[11px] font-semibold tracking-wider text-primary backdrop-blur-xl">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <span className="relative">VS</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            CompareCard Render (tie + alignment)
          </h2>
          <div className="relative grid items-stretch gap-4 sm:grid-cols-2 sm:gap-6">
            <CompareCard report={reportShortTitle} winner={false} />
            <CompareCard report={reportTie} winner={false} />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center sm:flex">
              <div className="relative flex items-center justify-center rounded-full border border-primary/40 bg-card/80 px-3 py-1 text-[10px] font-semibold tracking-wider text-primary backdrop-blur-xl">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <span className="relative">Too close to call</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function CompareCard({
  report,
  winner,
}: {
  report: ReturnType<typeof buildReport>;
  winner: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-5 transition-all",
        winner
          ? "border-primary/50 bg-primary/5"
          : "border-border/60 bg-secondary/20",
      )}
      style={winner ? { boxShadow: "var(--shadow-glow)" } : undefined}
    >
      {winner && (
        <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-background px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          Better pick
        </span>
      )}
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
          <div className="pb-1 text-xs text-muted-foreground">/ 5</div>
        </div>
        <div className="mt-1 text-lg leading-none">{renderBooks(report.overallScore)}</div>
        <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {report.executiveSummary}
        </p>
        <a
          href={`/report?url=${encodeURIComponent(report.url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View full report
        </a>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border/60 bg-background/40 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Worth</div>
          <div className="mt-0.5 text-sm font-medium">{report.worthWatching}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Length</div>
          <div className="mt-0.5 text-sm font-medium">{Math.round(report.durationSec / 60)}m</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Saved</div>
          <div className="mt-0.5 text-sm font-medium">{Math.round(report.timeSavedSec / 60)}m</div>
        </div>
      </dl>
    </div>
  );
}

function renderBooks(score: number): string {
  const full = Math.round(score);
  return "📚".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
}
