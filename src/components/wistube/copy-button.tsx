import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  getText,
  className,
}: {
  getText: () => string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = getText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable — fail silently, no crash.
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[11px] border border-border/60 bg-secondary/40 px-3 text-xs font-medium text-muted-foreground backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:border-border hover:bg-secondary/70 hover:text-foreground active:scale-[0.97]",
        copied && "border-emerald-500/30 text-emerald-500 hover:text-emerald-500",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
