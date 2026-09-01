/**
 * Fixed background wash. The product's visual language is "paper and ink" —
 * a flat, quiet ground with a single faint vignette, not a drifting
 * multi-color blur. Motion is intentionally absent here; it's spent
 * elsewhere, on states that respond to what the person does.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
    </div>
  );
}
