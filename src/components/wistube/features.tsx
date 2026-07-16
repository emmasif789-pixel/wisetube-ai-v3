import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Gauge,
  ListTree,
  Map,
  MessagesSquare,
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
    description: "A clear verdict on whether a video is worth watching.",
  },
  {
    icon: Clock,
    title: "Time Saved",
    description: "See exactly how many minutes you'll reclaim.",
  },
  {
    icon: Gauge,
    title: "Learning Score",
    description: "Signal-over-noise, quantified from 0 to 100.",
  },
  {
    icon: ListTree,
    title: "Learning Timeline",
    description: "A structured outline of what you'll actually learn.",
  },
  {
    icon: Map,
    title: "Skip Map",
    description: "Know which sections to skip and which to rewatch.",
  },
  {
    icon: MessagesSquare,
    title: "Ask AI",
    description: "Ask any question about the video and get answers.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Learn faster. Watch smarter.
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            A calm, focused toolkit that turns any YouTube video into a
            decision, not a time sink.
          </p>
        </div>

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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-colors hover:border-primary/40"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at 50% 0%, oklch(0.86 0.14 90 / 0.12), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-secondary/60 transition-transform duration-300 group-hover:scale-105 group-hover:border-primary/40">
          <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>
        <h3 className="mt-5 text-base font-semibold text-foreground">
          {feature.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}