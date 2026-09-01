/**
 * Fixed, GPU-accelerated aurora background. Sits behind all content, respects
 * the current theme via CSS custom properties, and gently drifts.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* Aurora blobs */}
      <div
        className="animate-aurora absolute -top-[20%] left-[10%] h-[60vh] w-[60vw] rounded-full opacity-70 blur-3xl will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, oklch(0.68 0.22 275 / 0.28), transparent 60%)",
        }}
      />
      <div
        className="animate-aurora-slow absolute top-[10%] right-[-5%] h-[55vh] w-[55vw] rounded-full opacity-60 blur-3xl will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, oklch(0.72 0.20 320 / 0.22), transparent 60%)",
        }}
      />
      <div
        className="animate-aurora absolute bottom-[-15%] left-[20%] h-[55vh] w-[70vw] rounded-full opacity-50 blur-3xl will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 40% 60%, oklch(0.66 0.20 240 / 0.20), transparent 60%)",
          animationDelay: "-8s",
        }}
      />

      {/* Fine grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          color: "var(--color-foreground)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent 80%)",
        }}
      />
    </div>
  );
}