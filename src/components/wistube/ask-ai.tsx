import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { MessagesSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { chatAboutVideo } from "@/lib/chat.functions";
import type { LearningReport } from "@/lib/report-data";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain this like I'm 12",
  "Give me the action items",
  "What's the weakest part of this argument?",
  "Summarize the strongest section",
];

export function AskAi({ report }: { report: LearningReport }) {
  const chat = useServerFn(chatAboutVideo);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    const history = messages;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const { answer } = await chat({
        data: {
          question: q,
          history,
          context: {
            title: report.title,
            channel: report.channel,
            executiveSummary: report.executiveSummary,
            keyInsights: report.keyInsights,
            chapters: report.chapters.map((c) => ({
              title: c.title,
              start: c.start,
              summary: c.summary,
            })),
          },
        },
      });
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get answer.");
    } finally {
      setLoading(false);
    }
  };

  const askSuggestion = (q: string) => {
    if (loading) return;
    setInput(q);
    setTimeout(() => formRef.current?.requestSubmit(), 0);
  };

  return (
    <div className="flex flex-col">
      <div
        ref={scrollRef}
        className="max-h-[420px] min-h-[200px] space-y-3 overflow-y-auto px-5 py-4"
      >
        {messages.length === 0 && !loading && (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <MessagesSquare className="h-5 w-5 text-primary" />
            </div>
            <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">
              Ask any question about this video — timelines, takeaways, or examples.
            </p>
            <div className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => askSuggestion(s)}
                  className="rounded-full border border-border/60 bg-secondary/40 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl border px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "border-primary/25 bg-primary/10 text-foreground"
                    : "border-border/60 bg-secondary/40 text-foreground/90",
                )}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-2.5 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <Dot delay={0} />
                  <Dot delay={0.15} />
                  <Dot delay={0.3} />
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <form
        ref={formRef}
        onSubmit={send}
        className="flex gap-2 border-t border-border/60 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask any question about this video…"
          className="flex-1 rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-10 rounded-xl px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.1, repeat: Infinity, delay }}
    />
  );
}
