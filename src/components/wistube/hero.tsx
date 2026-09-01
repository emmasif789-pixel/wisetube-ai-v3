import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Youtube } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|v\/)[\w-]{6,}|youtu\.be\/[\w-]{6,})(\S*)?$/i;

export function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const navigate = useNavigate();

  const DEMO_VIDEO = {
    label: "Elon Musk interview",
    url: "https://youtu.be/Rni7Fz7208c?si=zTa6FUeBcyChDoXI",
  };

  const handleDemoClick = () => {
    if (loading) return;
    setUrl(DEMO_VIDEO.url);
    setInputFocused(false);
    setLoading(true);
    setTimeout(() => {
      navigate({ to: "/report", search: { url: DEMO_VIDEO.url } });
    }, 400);
  };

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
    <section id="home" className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-balance font-serif text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-foreground sm:text-6xl md:text-[4.5rem]"
        >
          A verdict on every video, before you press play.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mx-auto mt-6 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Paste a YouTube link. Get a scored Learning Report, a skip map of
          what's worth your time, and a quiz to make sure it stuck.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-xl"
        >
          <div
            className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-2 transition-colors duration-200 focus-within:border-primary/50 sm:flex-row sm:items-center sm:gap-1"
            style={{ boxShadow: "var(--shadow-input)" }}
          >
            <div className="relative flex flex-1 items-center gap-3 px-3 py-2.5">
              <Youtube className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="url"
                placeholder="Paste a YouTube video link"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"
                aria-label="YouTube video URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 150)}
                disabled={loading}
              />
              <AnimatePresence>
                {inputFocused && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-lg border border-border bg-popover p-1"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleDemoClick}
                      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-150 hover:bg-secondary"
                    >
                      <Youtube className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="flex-1 text-sm text-foreground">
                        Try it on: {DEMO_VIDEO.label}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-11 rounded-lg px-6 font-medium"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              {loading ? (
                <>
                  Analyzing
                  <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Get the report"
              )}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Free, and no account needed.
          </p>
        </motion.form>
      </div>
    </section>
  );
}
