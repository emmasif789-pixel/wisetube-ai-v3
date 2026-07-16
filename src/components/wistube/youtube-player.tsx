import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface YouTubePlayerHandle {
  seekTo: (seconds: number, andPlay?: boolean) => void;
}

// Minimal typing for the YT iframe API surface we use.
type YTPlayer = {
  seekTo: (s: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: { onReady?: (e: { target: YTPlayer }) => void };
        },
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, { videoId: string }>(
  function YouTubePlayer({ videoId }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const readyRef = useRef(false);
    const pendingSeek = useRef<{ s: number; play: boolean } | null>(null);

    useImperativeHandle(ref, () => ({
      seekTo(seconds, andPlay = true) {
        if (playerRef.current && readyRef.current) {
          playerRef.current.seekTo(seconds, true);
          if (andPlay) playerRef.current.playVideo();
        } else {
          pendingSeek.current = { s: seconds, play: andPlay };
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;
      loadYouTubeAPI().then(() => {
        if (cancelled || !containerRef.current || !window.YT) return;
        const mount = document.createElement("div");
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(mount);
        playerRef.current = new window.YT.Player(mount, {
          videoId,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: () => {
              readyRef.current = true;
              if (pendingSeek.current && playerRef.current) {
                playerRef.current.seekTo(pendingSeek.current.s, true);
                if (pendingSeek.current.play) playerRef.current.playVideo();
                pendingSeek.current = null;
              }
            },
          },
        });
      });
      return () => {
        cancelled = true;
        readyRef.current = false;
        try {
          playerRef.current?.destroy();
        } catch {
          /* noop */
        }
        playerRef.current = null;
      };
    }, [videoId]);

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-black">
        <div ref={containerRef} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full" />
      </div>
    );
  },
);