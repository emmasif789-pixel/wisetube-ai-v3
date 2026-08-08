import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Gauge,
  ListTree,
  Map,
  MessagesSquare,
  Scale,
  GitCompareArrows,
  HelpCircle,
  Dna,
  Combine,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: FileText,
    title: "Learning Report",
    description: "A complete AI analysis that reveals what the video is truly worth.",
  },
  {
    icon: Combine,
    title: "Merge",
    description: "Paste 2–5 videos on the same topic and get one unified learning guide — common ground, conflicts, and a single roadmap.",
  },
  {
    icon: Clock,
    title: "Time Saved",
    description: "Know in seconds whether the video deserves your time.",
  },
  {
    icon: Gauge,
    title: "Learning Quality Assessment",
    description: "Measure clarity, depth, structure, evidence, and real learning value.",
  },
  {
    icon: ListTree,
    title: "Learning Timeline",
    description: "Navigate every key idea through a structured learning journey.",
  },
  {
    icon: Map,
    title: "Skip Map",
    description: "Instantly identify what to watch, skim, or skip—with the best moment highlighted.",
  },
  {
    icon: Scale,
    title: "AI Debate",
    description: "Challenge every perspective with balanced arguments before forming your own.",
  },
  {
    icon: MessagesSquare,
    title: "Ask AI",
    description: "Turn every video into an interactive conversation with your personal AI tutor.",
  },
  {
    icon: GitCompareArrows,
    title: "Compare",
    description: "Put two videos head-to-head and discover the smarter learning investment.",
  },
  {
    icon: HelpCircle,
    title: "AI Quiz",
    description: "Reinforce your understanding with an AI-generated knowledge check in minutes.",
  },
  {
    icon: Dna,
    title: "Video DNA",
    description: "See the true composition of every video—from core ideas to filler.",
  },
  {
    icon: Combine,
    title: "Merge",
    description: "Turn multiple experts into one master guide — shared insights, conflicting takes, and a single action plan.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Features
          </p>
          <h2
            className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl"
          >
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              Learn faster.
            </span>{" "}
            <span
              className="italic font-serif font-normal bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-text)",
                fontFamily:
                  "'Instrument Serif', 'Cormorant Garamond', ui-serif, Georgia, serif",
              }}
            >
              Watch smarter.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            A calm, focused toolkit that turns any YouTube video into a
            decision, not a time sink.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.06,
      }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-[0_20px_50px_-20px_var(--color-primary)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Animated top hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(500px circle at 50% 0%, oklch(0.68 0.22 275 / 0.22), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-secondary to-secondary/50 shadow-[inset_0_1px_0_0_var(--color-foreground)/6] transition-all duration-300 group-hover:scale-105 group-hover:border-primary/60 group-hover:shadow-[0_0_0_1px_var(--color-primary)/40,0_8px_20px_-6px_var(--color-primary)/40]">
          <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" strokeWidth={2.2} />
        </div>
        <h3 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-foreground">
          {feature.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
