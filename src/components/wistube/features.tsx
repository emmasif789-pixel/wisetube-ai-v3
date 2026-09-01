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
    description: "A complete analysis that reveals what the video is truly worth.",
  },
  {
    icon: Gauge,
    title: "Learning Quality Assessment",
    description: "Clarity, depth, structure, evidence, and real learning value, scored.",
  },
  {
    icon: Map,
    title: "Skip Map",
    description: "What to watch, skim, or skip — with the best moment highlighted.",
  },
  {
    icon: ListTree,
    title: "Learning Timeline",
    description: "Every key idea, in order, so you can jump straight to what matters.",
  },
  {
    icon: Dna,
    title: "Video DNA",
    description: "The true composition of the video — from core ideas to filler.",
  },
  {
    icon: HelpCircle,
    title: "Quiz",
    description: "A short knowledge check generated from what you just learned.",
  },
  {
    icon: MessagesSquare,
    title: "Ask AI",
    description: "Ask follow-up questions, grounded in the video's own transcript.",
  },
  {
    icon: Scale,
    title: "Debate",
    description: "The main viewpoint, the counterargument, and a balanced read.",
  },
  {
    icon: GitCompareArrows,
    title: "Compare",
    description: "Put two videos head-to-head to see which is worth your time.",
  },
  {
    icon: Combine,
    title: "Merge",
    description: "Combine 2–5 videos on one topic into a single unified guide.",
  },
  {
    icon: Clock,
    title: "Time Saved",
    description: "Know in seconds whether a video deserves the time it asks for.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-balance font-serif text-4xl font-medium leading-[1.08] tracking-[-0.015em] text-foreground sm:text-5xl">
            Everything in the report.
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            One link in, eleven ways to decide if it's worth watching.
          </p>
        </motion.div>

        <div className="mt-14 divide-y divide-border border-y border-border">
          {features.map((f, i) => (
            <FeatureRow key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay: Math.min(index * 0.04, 0.3) }}
      className="group flex items-start gap-5 py-5 sm:gap-6 sm:py-6"
    >
      <span className="mt-0.5 font-mono text-sm text-muted-foreground/70 tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.8} />
      <div className="flex-1">
        <h3 className="text-base font-medium text-foreground sm:text-lg">
          {feature.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
