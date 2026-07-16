import { formatTimestamp } from "./youtube";

export type SkipSegmentKind = "watch" | "optional" | "skip";

export interface Chapter {
  id: string;
  title: string;
  start: number; // seconds
  summary: string;
}

export interface SkipSegment {
  id: string;
  kind: SkipSegmentKind;
  label: string;
  start: number;
  end: number;
  reason: string;
}

export interface ScoreBreakdownItem {
  label: string;
  score: number; // 0-5
}

export interface LearningReport {
  videoId: string;
  url: string;
  title: string;
  channel: string;
  category: string;
  language: string;
  durationSec: number;
  timeSavedSec: number;
  worthWatching: "Yes" | "Skim" | "No";
  overallScore: number; // 0-5, one decimal
  scoreExplanation: string;
  scoreBreakdown: ScoreBreakdownItem[];
  executiveSummary: string;
  keyInsights: { title: string; body: string }[];
  chapters: Chapter[];
  skipMap: SkipSegment[];
}

// Deterministic pseudo-random from a string
function hashCode(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

const TITLES = [
  "How to Learn Anything Faster",
  "The Science of Deep Focus",
  "Mastering Your First Hour",
  "Building Habits That Actually Stick",
  "A Practical Guide to Systems Thinking",
  "Why Smart People Struggle with Simple Ideas",
];
const CHANNELS = ["Ali Abdaal", "Veritasium", "Nathaniel Drew", "Thomas Frank", "Andrew Huberman"];
const CATEGORIES = ["Education", "Productivity", "Science", "Self-Improvement"];

const CHAPTER_TITLES = [
  "Introduction",
  "Core Concepts",
  "Framework Overview",
  "Practical Example",
  "Common Mistakes",
  "Advanced Techniques",
  "Real-World Application",
  "Conclusion & Takeaways",
];

const INSIGHT_TITLES = [
  "The 80/20 of the topic",
  "A counterintuitive idea",
  "One rule to remember",
  "What most people miss",
  "The single best example",
  "Where creators oversimplify",
];

const INSIGHT_BODIES = [
  "Focus on the first principle before optimizing the details — the compounding effect is what matters most.",
  "The presenter reframes the common belief and shows why the opposite is often true in practice.",
  "A tight, repeatable checklist you can apply to your next session without rewatching the video.",
  "Most viewers leave without noticing that the demonstration hinges on one specific assumption.",
  "The mid-video walkthrough is where the theory becomes concrete — everything before is context.",
  "Nuance is skipped when the topic gets emotional; the video acknowledges this openly.",
];

export function buildReport(url: string, videoId: string): LearningReport {
  const rand = seeded(hashCode(videoId));

  const durationMin = 18 + Math.floor(rand() * 30); // 18..47
  const durationSec = durationMin * 60;

  // 5 chapters spread across the duration
  const chapterCount = 5;
  const chapters: Chapter[] = Array.from({ length: chapterCount }).map((_, i) => {
    const start = Math.floor((i / chapterCount) * durationSec + (i === 0 ? 0 : rand() * 30));
    return {
      id: `c${i}`,
      title: CHAPTER_TITLES[i] ?? `Section ${i + 1}`,
      start,
      summary: pick(rand, INSIGHT_BODIES),
    };
  });

  // Skip map: 4 segments alternating watch/optional/skip
  const kinds: SkipSegmentKind[] = ["watch", "optional", "watch", "skip"];
  const labels: Record<SkipSegmentKind, string> = {
    watch: "Must Watch",
    optional: "Optional",
    skip: "Skip",
  };
  const reasons: Record<SkipSegmentKind, string> = {
    watch: "High-signal explanation with the core idea and an example.",
    optional: "Useful context but not required to understand the main point.",
    skip: "Repetition, sponsor read, or tangent — safe to skip.",
  };
  const cuts = [0, 0.22, 0.5, 0.72, 1].map((p) => Math.floor(p * durationSec));
  const skipMap: SkipSegment[] = kinds.map((kind, i) => ({
    id: `s${i}`,
    kind,
    label: labels[kind],
    start: cuts[i],
    end: cuts[i + 1],
    reason: reasons[kind],
  }));

  const timeSavedSec = skipMap
    .filter((s) => s.kind !== "watch")
    .reduce((acc, s) => acc + (s.end - s.start) * (s.kind === "skip" ? 1 : 0.5), 0);

  const breakdown: ScoreBreakdownItem[] = [
    { label: "Content Depth", score: 3 + rand() * 2 },
    { label: "Clarity", score: 3 + rand() * 2 },
    { label: "Accuracy", score: 3 + rand() * 2 },
    { label: "Structure", score: 3 + rand() * 2 },
    { label: "Practical Value", score: 3 + rand() * 2 },
    { label: "Beginner Friendliness", score: 3 + rand() * 2 },
  ].map((b) => ({ ...b, score: Math.round(b.score * 10) / 10 }));

  const overall =
    Math.round(
      (breakdown.reduce((a, b) => a + b.score, 0) / breakdown.length) * 10,
    ) / 10;

  const worth: LearningReport["worthWatching"] =
    overall >= 4 ? "Yes" : overall >= 3 ? "Skim" : "No";

  const title = pick(rand, TITLES);
  const channel = pick(rand, CHANNELS);
  const category = pick(rand, CATEGORIES);

  const keyInsights = Array.from({ length: 4 }).map(() => ({
    title: pick(rand, INSIGHT_TITLES),
    body: pick(rand, INSIGHT_BODIES),
  }));

  const executiveSummary = `${title} delivers a ${category.toLowerCase()} walkthrough that pays off in the middle third. The strongest stretch runs from ${formatTimestamp(
    chapters[1].start,
  )} to ${formatTimestamp(
    chapters[3].start,
  )}, where the core framework is applied to a concrete example. The introduction and closing are lighter — you can safely skim them if you're short on time.`;

  const scoreExplanation = `The video scores strongly on clarity and structure, with a well-paced walkthrough and a memorable example. Depth is solid but not exhaustive — advanced viewers may want a follow-up source. Overall, it earns ${overall.toFixed(
    1,
  )} out of 5 for being genuinely useful without wasting your time.`;

  return {
    videoId,
    url,
    title,
    channel,
    category,
    language: "English",
    durationSec,
    timeSavedSec: Math.floor(timeSavedSec),
    worthWatching: worth,
    overallScore: overall,
    scoreExplanation,
    scoreBreakdown: breakdown,
    executiveSummary,
    keyInsights,
    chapters,
    skipMap,
  };
}