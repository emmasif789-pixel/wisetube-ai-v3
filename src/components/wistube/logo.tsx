import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-accent/80 shadow-[var(--shadow-glow)]">
        <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
      </div>
      {showWordmark && (
        <span className="text-base font-semibold tracking-tight text-foreground">
          WiseTube <span className="text-muted-foreground font-normal">AI</span>
        </span>
      )}
    </div>
  );
}
