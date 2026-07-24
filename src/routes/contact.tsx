import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Aurora } from "@/components/wistube/aurora";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      <Navbar />
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-primary" />
            About
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              About
            </span>{" "}
            <span
              className="italic font-serif font-normal bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-text)",
                fontFamily:
                  "'Instrument Serif', 'Cormorant Garamond', ui-serif, Georgia, serif",
              }}
            >
              WisTube AI
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
            <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">
              Watch less. Learn more.
            </p>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Every day, millions of people spend hours watching YouTube
                videos searching for a few valuable insights.
              </p>
              <p>
                WisTube AI transforms long videos into structured knowledge,
                helping students, professionals, and lifelong learners
                understand more in less time.
              </p>
              <p>
                We believe AI shouldn't replace learning — it should remove
                the friction around it.
              </p>
              <p className="text-foreground">
                Our mission is simple: transform YouTube from a place to
                watch into a place to learn.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
