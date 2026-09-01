import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

/**
 * The mark: a notched seal with a check-stroke through it — the product's
 * job is to render a verdict on a video, so the logo reads as a stamp of
 * judgment rather than a generic "AI" glyph.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 1.5l3.53 2.1 4.1-.4 1.5 3.86 3.6 2-1 4 1 4-3.6 2-1.5 3.86-4.1-.4L16 30.5l-3.53-2.1-4.1.4-1.5-3.86-3.6-2 1-4-1-4 3.6-2 1.5-3.86 4.1.4z"
        fill="var(--color-primary)"
      />
      <path
        d="M11 16.5l3.4 3.4L21.5 12"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-7 w-7" />
      {showWordmark && (
        <span className="font-serif text-lg font-medium tracking-tight text-foreground">
          WisTube
        </span>
      )}
    </div>
  );
}
