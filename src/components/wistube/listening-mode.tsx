import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ListenSection } from "@/hooks/use-listening-mode";

type ListeningState = {
  supported: boolean;
  active: boolean;
  playing: boolean;
  paused: boolean;
  rate: number;
  sentenceIndex: number;
  totalSentences: number;
  finished: boolean;
  flat: { sectionIndex: number; text: string }[];
  toggle: () => void;
  stop: () => void;
  togglePause: () => void;
  changeRate: (r: number) => void;
};

export function ListenTriggerButton({ state }: { state: ListeningState }) {
  if (!state.supported) return null;
  const isPlaying = state.playing && !state.paused;

  return (
    <button
      type="button"
      onClick={state.toggle}
      aria-label={state.active ? "Stop listening" : "Listen to summary"}
      className={cn(
        "group relative flex h-9 items-center gap-2 overflow-hidden rounded-full px-4 text-xs font-medium transition-all duration-300 active:scale-[0.97]",
        state.active
          ? "text-primary-foreground"
          : "border border-primary/30 bg-secondary/40 text-foreground hover:border-primary/50 hover:bg-secondary/60",
      )}
      style={
        state.active
          ? {
              backgroundImage:
                "linear-gradient(135deg, var(--color-primary), oklch(0.6 0.2 300))",
              boxShadow: "var(--shadow-glow)",
            }
          : undefined
      }
    >
      {/* Pulsing halo ring while actively playing */}
      {isPlaying && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 0 2px var(--color-primary)" }}
          animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.18, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}

      {/* Icon: headphones normally, mini animated waveform while playing */}
      {isPlaying ? (
        <span className="flex h-3.5 w-3.5 shrink-0 items-end gap-[2px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[2.5px] rounded-full bg-primary-foreground"
              animate={{ height: ["30%", "100%", "45%", "85%", "30%"] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </span>
      ) : (
        <Headphones
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110",
            state.active && "text-primary-foreground",
          )}
        />
      )}

      <span className="relative">
        {state.active ? (state.paused ? "Paused" : "Listening") : "Listen"}
      </span>
    </button>
  );
}

export function ListenPanel({
  sections,
  state,
  onContinue,
}: {
  sections: ListenSection[];
  state: ListeningState;
  onContinue?: () => void;
}) {
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  useEffect(() => {
    if (!state.active) return;
    const el = sentenceRefs.current[state.sentenceIndex];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state.sentenceIndex, state.active]);

  useEffect(() => {
    if (!state.active || !containerRef.current) return;
    const node = containerRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => setShowMiniPlayer(!entry.isIntersecting && state.playing),
      { threshold: 0 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [state.active, state.playing]);

  if (!state.supported) return null;

  const progressPct = state.totalSentences
    ? (state.sentenceIndex / state.totalSentences) * 100
    : 0;

  return (
    <>
      <AnimatePresence>
        {state.active && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 overflow-hidden rounded-2xl border border-primary/25 bg-primary/[0.04] p-5"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {!state.finished ? (
              <>
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {sections.map((s, si) => (
                    <p key={si} className="text-sm leading-relaxed">
                      <span className="mr-1.5 text-xs font-semibold uppercase tracking-wider text-primary/70">
                        {s.label}:
                      </span>
                      {state.flat
                        .map((f, fi) => ({ ...f, fi }))
                        .filter((f) => f.sectionIndex === si)
                        .map((f) => (
                          <span
                            key={f.fi}
                            ref={(el) => {
                              sentenceRefs.current[f.fi] = el;
                            }}
                            className={cn(
                              "rounded transition-all duration-500",
                              f.fi === state.sentenceIndex
                                ? "bg-primary/15 text-foreground shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                                : f.fi < state.sentenceIndex
                                  ? "text-muted-foreground/50"
                                  : "text-foreground/90",
                            )}
                          >
                            {f.text}{" "}
                          </span>
                        ))}
                    </p>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={state.togglePause}
                    aria-label={state.paused ? "Resume" : "Pause"}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                  >
                    {state.paused ? (
                      <Play className="h-4 w-4 fill-current" />
                    ) : (
                      <Pause className="h-4 w-4 fill-current" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
                      <motion.div
                        className="h-full rounded-full bg-primary/80"
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Sentence {Math.min(state.sentenceIndex + 1, state.totalSentences)} of{" "}
                      {state.totalSentences}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 1.5, 2].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => state.changeRate(r)}
                        className={cn(
                          "rounded-full px-2 py-1 text-[10px] font-medium transition-colors",
                          state.rate === r
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/60 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {r}×
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={state.stop}
                    aria-label="Close listening mode"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-2 text-center"
              >
                <p className="text-sm font-medium text-foreground">✓ Finished listening</p>
                <Button
                  onClick={() => {
                    state.stop();
                    onContinue?.();
                  }}
                  className="mt-3 h-9 rounded-xl px-4 text-xs"
                >
                  Continue to Learning Timeline
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMiniPlayer && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border/60 bg-card/95 px-4 py-2.5 backdrop-blur-xl"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <button
              type="button"
              onClick={state.togglePause}
              aria-label={state.paused ? "Resume" : "Pause"}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              {state.paused ? (
                <Play className="h-3 w-3 fill-current" />
              ) : (
                <Pause className="h-3 w-3 fill-current" />
              )}
            </button>
            <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary/60">
              <div className="h-full rounded-full bg-primary/80" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">Listening…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
