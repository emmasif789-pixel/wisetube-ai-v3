import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { Check, Clock, HelpCircle, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
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
  const [displayScore, setDisplayScore] = useState(0);

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
    setDisplayScore(0);
  };

  // Once an answer is picked, pressing Enter advances to the next question —
  // same action as clicking the "Next" button. Only active while a quiz is
  // in progress and an answer has been selected for the current question.
  useEffect(() => {
    if (!questions || done || selected === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [questions, done, selected, index]);

  // Animate the final score counting up from 0, once the results screen appears.
  useEffect(() => {
    if (!done) return;
    setDisplayScore(0);
    const duration = 600;
    const steps = Math.max(1, score);
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setDisplayScore(current);
      if (current >= score) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [done, score]);

  if (!questions) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
          Test your understanding with a quiz generated from this video.
        </p>
        <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-primary" /> 5 Questions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> ~90 seconds
          </span>
        </div>
        <Button
          onClick={start}
          disabled={loading}
          className="mt-5 h-10 rounded-xl px-5"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            "Start Quiz →"
          )}
        </Button>
      </div>
    );
  }

  if (done) {
    const outOf5 = (score / questions.length) * 5;
    const pct = Math.round((score / questions.length) * 100);
    const remark =
      pct >= 80 ? "Excellent work!" : pct >= 50 ? "Nice effort!" : "Worth a rewatch.";
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
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mt-2 text-4xl font-semibold tracking-tight"
        >
          {displayScore} <span className="text-lg text-muted-foreground">/ {questions.length}</span>
        </motion.div>
        <p className="mt-1 text-xs text-muted-foreground">{remark}</p>
        <div className="mt-3 text-2xl leading-none">{renderBooks(outOf5)}</div>
        <div className="mx-auto mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-secondary/60">
          <motion.div
            className="h-full rounded-full bg-primary/80"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </div>
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
  const progress = ((index + (selected !== null ? 1 : 0)) / questions.length) * 100;
  return (
    <div className="p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          Score {score}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary/60">
        <motion.div
          className="h-full rounded-full bg-primary/80"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={revealed}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
                  whileHover={!revealed ? { scale: 1.01 } : undefined}
                  whileTap={!revealed ? { scale: 0.99 } : undefined}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors",
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
                  <AnimatePresence>
                    {revealed && isCorrect && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      </motion.span>
                    )}
                    {revealed && !isCorrect && isPicked && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <X className="h-4 w-4 shrink-0 text-red-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
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
