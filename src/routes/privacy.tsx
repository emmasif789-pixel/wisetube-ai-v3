import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Aurora } from "@/components/wistube/aurora";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

function Privacy() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      <Navbar />
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Legal
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              Privacy
            </span>{" "}
            <span
              className="italic font-serif font-normal bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-text)",
                fontFamily:
                  "'Instrument Serif', 'Cormorant Garamond', ui-serif, Georgia, serif",
              }}
            >
              Policy
            </span>
          </h1>

          <div
            className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-card/80 p-8 backdrop-blur-xl sm:p-10"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent opacity-60"
            />
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                WiseTube AI only processes the YouTube content you submit —
                the video's transcript — in order to generate your learning
                report, quiz, and other insights. We don't collect or store
                more than what's needed to produce that analysis.
              </p>
              <p>
                We do not sell personal data, and we do not share your
                submitted content with third parties beyond the AI services
                used to generate your results.
              </p>
              <p>
                If you have questions about how your data is handled, reach
                out through the Contact page — we're happy to explain
                further.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
