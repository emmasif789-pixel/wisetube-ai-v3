import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles, Youtube } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|v\/)[\w-]{6,}|youtu\.be\/[\w-]{6,})(\S*)?$/i;

export function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter a YouTube URL.");
      return;
    }
    if (!YOUTUBE_REGEX.test(trimmed)) {
      toast.error("Please enter a valid YouTube video URL.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      navigate({ to: "/report", search: { url: trimmed } });
    }, 400);
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32"
    >
      {/* Subtle hero wash (aurora sits behind everything globally) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />

      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md shadow-[0_1px_0_0_var(--color-foreground)/5_inset]"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
          </span>
          Your AI learning companion for YouTube
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          className="text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl md:text-7xl lg:text-[5.25rem]"
        >
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-text)" }}
          >
            Watch Less.
          </span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-text)" }}
          >
            Learn More.
          </span>{" "}
          <span
            className="italic font-serif font-normal bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-text)", fontFamily: "'Instrument Serif', 'Cormorant Garamond', ui-serif, Georgia, serif" }}
          >
            Instantly.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed tracking-[-0.005em] text-muted-foreground sm:text-lg"
        >
          Turn any YouTube video into clear, actionable knowledge in seconds.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
          onSubmit={handleSubmit}
          className="mx-auto mt-12 max-w-2xl"
        >
          <div
            className="group relative flex flex-col gap-2 rounded-2xl border border-white/[0.09] bg-card/60 p-2 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] focus-within:border-primary/50 sm:flex-row sm:items-center sm:gap-1 sm:pr-2"
            style={{ boxShadow: "var(--shadow-input)" }}
          >
            {/* Top hairline highlight */}
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70"
              aria-hidden
            />
            <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
              <Youtube className="h-5 w-5 shrink-0 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
              <input
                type="url"
                placeholder="Paste a YouTube video link…"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"
                aria-label="YouTube video URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="group/btn h-11 rounded-xl px-6 font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              {loading ? (
                <>
                  <Sparkles className="mr-1 h-4 w-4 animate-pulse" />
                  Analyzing Video...
                  <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Analyze Video
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/80">
            Free to try · No account required
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/60">
            For lengthy videos, we intelligently focus on the richest sections first.
          </p>
        </motion.form>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 sm:bottom-10"
        aria-hidden
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">
          Scroll
        </span>
        <div className="relative h-9 w-px overflow-hidden rounded-full bg-gradient-to-b from-transparent via-border to-transparent">
          <motion.span
            className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
            style={{
              background: "var(--color-primary)",
              boxShadow: "0 0 8px 1px var(--color-primary)",
            }}
            animate={{ y: [0, 30, 0], opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
