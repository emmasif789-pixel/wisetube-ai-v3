<div align="center">

# WisTube AI

### The fastest way to learn from YouTube.

Turn hours of video into minutes of understanding.

[Live Demo] (https://wistube-ai-v3-dev.vercel.app)

</div>

---

## The Internet Solved Access. It Never Solved Time.

You open YouTube to learn one thing.

Forty minutes later, you're still looking for it.

You watched the intro. Skipped the sponsor. Rewound three explanations. Opened five more tabs.

And somehow — you still don't have your answer.

**WisTube AI reads the entire video and tells you the truth:** what it's actually about, whether it's worth your time, exactly where the value is, and what you'll walk away knowing — before you spend a minute watching.

## What Makes This Different

Most AI video tools summarize. A summary of a bad video is still a bad video, just shorter.

**WisTube judges.** A video with 200 million views and a video with 200 views get held to the same standard. Feed it a real lecture — it scores it 4.5/5, "Watch." Feed it a music video with no educational content — it scores it 1.5/5, "Skip it," and shows exactly why.

We don't believe every video deserves your time. AI should be honest enough to say so.

## Before / After

| Watching YouTube to Learn | Watching YouTube with WisTube |
|---|---|
| Watch the whole video, hope it's useful | Know in seconds if it's worth it |
| Skip around guessing where the value is | Skip Map shows exactly where |
| Take notes manually | AI-generated Learning Report |
| Forget most of it tomorrow | 5-question quiz reinforces it |
| Watch one video at a time | Compare two videos side by side |

## Features

- **Learning Report** — honest 0–5 score across content depth, clarity, accuracy, structure, practical value, and beginner-friendliness
- **Skip Map** — the video's timeline color-coded watch / optional / skip
- **Learning Timeline** — chaptered, clickable, jumps the player to the moment that matters
- **Ask AI** — a real conversation about the video's content, grounded in its full transcript
- **Compare Videos** — see, objectively, which of two videos is worth your time
- **Test Your Knowledge** — a 5-question quiz generated from what you just learned

All six, shipped and live — not a roadmap slide.

## Why Now

AI has made creating content easier than ever — more is uploaded every day than anyone could watch in a lifetime. The problem stopped being access to information. It's now filtering it.

The next wave of useful AI products won't help people create more. They'll help people understand more, faster. WisTube is built for that shift.

## Design Philosophy

Every screen follows one principle: reduce cognitive load.

We removed everything that distracts from learning and kept only what helps someone understand faster. Every interaction is designed to answer one question — *what should I learn next?*

## Why We Built This

We built WisTube because we hit the same wall ourselves.

We weren't struggling to find information. We were struggling to find the five valuable minutes hidden inside an hour-long video.

AI shouldn't just summarize information. It should respect people's time.

## Tech Stack

**Frontend:** TanStack Start (React) · Tailwind · Framer Motion
**AI:** Groq (Llama 3.3 70B, automatic fallback to Llama 3.1 8B)
**Transcripts:** youtube-transcript.io
**Deployment:** Vercel

## Engineering Challenges We Actually Had to Solve

- **Datacenter IP blocking** — YouTube blocks scraping from cloud servers. Solved by routing transcript retrieval through a dedicated API instead of scraping directly.
- **Token limits on long videos** — a 2-hour transcript blows past Groq's free-tier rate limits. Solved with dynamic transcript sizing and automatic model fallback based on input length.
- **AI timestamp hallucination** — LLMs occasionally invent a timestamp that doesn't exist in the video. Solved with a hard validation layer that catches and corrects any out-of-range timestamp before it reaches the user, regardless of what the model outputs.

Building reliable AI products isn't about writing prompts. It's about building systems that keep working when reality gets messy.

## Try It

Paste any YouTube link at **[wistube-ai.vercel.app](https://wistube-ai.vercel.app)**. No account required.

Try a real lecture. Then try a music video. Watch the score tell the difference.

---

<div align="center">

*Built by one person who believes learning should be measured by understanding — not watch time.*

**Watch less. Learn more.** *Instantly.*

</div>
