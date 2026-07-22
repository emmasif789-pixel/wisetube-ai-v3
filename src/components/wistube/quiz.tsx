import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateQuiz, type QuizQuestion } from "@/lib/quiz.functions";
import type { LearningReport } from "@/lib/report-data";
import { cn } from "@/lib/utils";

export function Quiz({ report }: { report: LearningReport }) {
  const gen = useServerFn(generateQuiz);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const start = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await gen({
        data: {
          context: {
            title: report.title,
            executiveSummary: report.executiveSummary,
            keyInsights: report.keyInsights,
            chapters: report.chapters.map((c) => ({
              title: c.title,
              summary: c.summary,
            })),
          },
        },
      });
      setQuestions(res.questions);
      setIndex(0);
      setSelected(null);
      setScore(0);
      setDone(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const pick = (i: number) => {
    if (selected !== null || !questions) return;
    setSelected(i);
    if (i === questions[index].correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (!questions) return;
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const reset = () => {
    setQuestions(null);
    setDone(false);
    setSelected(null);
    setIndex(0);
    setScore(0);
  };

  if (!questions) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
          Test your understanding with a 5-question quiz generated from this video.
        </p>
        <Button
          onClick={start}
          disabled={loading}
          className="mt-4 h-10 rounded-xl px-5"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            "Start Quiz"
          )}
        </Button>
      </div>
    );
  }

  if (done) {
    const outOf5 = (score / questions.length) * 5;
    return (
      <motion.div
        key="done"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="p-6 text-center"
      >
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Your Score
        </p>
        <div className="mt-2 text-4xl font-semibold tracking-tight">
          {score} <span className="text-lg text-muted-foreground">/ {questions.length}</span>
        </div>
        <div className="mt-2 text-2xl leading-none">{renderBooks(outOf5)}</div>
        <Button
          onClick={reset}
          variant="outline"
          className="mt-5 h-10 rounded-xl px-5"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </motion.div>
    );
  }

  const q = questions[index];
  const progress = (index / questions.length) * 100;
  return (
    <div className="p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>Score {score}</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary/60">
        <motion.div
          className="h-full bg-primary/80"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-5"
        >
          <p className="text-base font-medium text-foreground sm:text-lg">
            {q.question}
          </p>
          <div className="mt-4 grid gap-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isPicked = selected === i;
              const revealed = selected !== null;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={revealed}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left text-sm transition-all",
                    !revealed &&
                      "border-border/60 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50",
                    revealed &&
                      isCorrect &&
                      "border-emerald-500/60 bg-emerald-500/20 text-foreground",
                    revealed &&
                      !isCorrect &&
                      isPicked &&
                      "border-red-500/60 bg-red-500/20 text-foreground",
                    revealed &&
                      !isCorrect &&
                      !isPicked &&
                      "border-border/60 bg-secondary/20 opacity-60",
                  )}
                >
                  <span>{opt}</span>
                  {revealed && isCorrect && (
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  {revealed && !isCorrect && isPicked && (
                    <X className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
            >
              <p className="text-xs leading-relaxed text-muted-foreground">
                {q.explanation}
              </p>
              <Button
                onClick={next}
                className="h-10 shrink-0 rounded-xl px-5"
              >
                {index + 1 >= questions.length ? "See Score" : "Next"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function renderBooks(score: number): string {
  const full = Math.round(score);
  return "📚".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
}