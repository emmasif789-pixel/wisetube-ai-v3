import { createFileRoute } from "@tanstack/react-router";
import { Mail, Twitter } from "lucide-react";
import { Navbar } from "@/components/wistube/navbar";
import { Footer } from "@/components/wistube/footer";
import { Aurora } from "@/components/wistube/aurora";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      <Navbar />
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-2xl px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Contact
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              Get in
            </span>{" "}
            <span
              className="italic font-serif font-normal bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-text)",
                fontFamily:
                  "'Instrument Serif', 'Cormorant Garamond', ui-serif, Georgia, serif",
              }}
            >
              touch.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Questions, feedback, or just want to say hi — reach out directly.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a
              href="mailto:emmasif789@gmail.com"
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-[0_20px_50px_-20px_var(--color-primary)]"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-secondary to-secondary/50 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/60">
                <Mail className="h-5 w-5 text-primary" strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-foreground">
                Email
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">
                emmasif789@gmail.com
              </p>
            </a>

            <a
              href="https://x.com/EmanAsifD"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-[0_20px_50px_-20px_var(--color-primary)]"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-secondary to-secondary/50 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/60">
                <Twitter className="h-5 w-5 text-primary" strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-foreground">
                X (Twitter)
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">
                @EmanAsifD
              </p>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
