import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Aurora } from "@/components/wistube/aurora";

export const Route = createFileRoute("/terms")({
  component: Terms,
});

function Terms() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      <Navbar />
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-medium text-primary">Legal</p>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              Terms of
            </span>{" "}
            <span
              className="italic font-serif font-normal bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-text)",
                fontFamily:
                  "'Instrument Serif', 'Cormorant Garamond', ui-serif, Georgia, serif",
              }}
            >
              Use
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
                WiseTube AI is an original product concept independently
                designed and developed to help people learn more efficiently
                from YouTube videos through AI-powered learning tools.
              </p>
              <p>
                AI-generated summaries, quizzes, reports, debates, and
                insights may occasionally contain inaccuracies. Users should
                verify important information with the original source when
                necessary.
              </p>
              <p>
                By using WiseTube AI, you agree to use the platform
                responsibly. All AI-generated content is intended to enhance
                learning, not replace personal judgment or the original
                creator's work.
              </p>
              <p className="text-foreground">
                © {new Date().getFullYear()} WiseTube AI. All rights reserved.
                The WiseTube AI branding, design, and original implementation
                are the intellectual property of its creator.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
