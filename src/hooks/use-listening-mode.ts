import { useEffect, useRef, useState } from "react";

export interface ListenSection {
  label: string;
  text: string;
}

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!parts) return [text.trim()].filter(Boolean);
  return parts.map((s) => s.trim()).filter(Boolean);
}

export function useListeningMode(sections: ListenSection[]) {
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Flatten all sentences across sections, tracking which section each belongs to.
  const flat: { sectionIndex: number; text: string }[] = [];
  sections.forEach((s, si) => {
    splitSentences(s.text).forEach((sentence) => flat.push({ sectionIndex: si, text: sentence }));
  });
  const totalSentences = flat.length;

  // Keep a ref to the flat array so the recursive speak() callback always
  // reads the latest value without needing to be redefined on every render.
  const flatRef = useRef(flat);
  flatRef.current = flat;

  const speak = (index: number, speed: number) => {
    if (!supported || index >= flatRef.current.length) {
      setPlaying(false);
      setFinished(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(flatRef.current[index].text);
    utterance.rate = speed;
    utterance.onend = () => {
      const next = index + 1;
      setSentenceIndex(next);
      if (next < flatRef.current.length) {
        speak(next, speed);
      } else {
        setPlaying(false);
        setFinished(true);
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const start = () => {
    if (!supported) return;
    setActive(true);
    setFinished(false);
    setPlaying(true);
    setPaused(false);
    setSentenceIndex(0);
    window.speechSynthesis.cancel();
    speak(0, rate);
  };

  const togglePause = () => {
    if (!supported || !playing) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const stop = () => {
    if (supported) window.speechSynthesis.cancel();
    setActive(false);
    setPlaying(false);
    setPaused(false);
    setSentenceIndex(0);
    setFinished(false);
  };

  const changeRate = (r: number) => {
    setRate(r);
    if (playing) {
      window.speechSynthesis.cancel();
      speak(sentenceIndex, r);
    }
  };

  const toggle = () => {
    if (active) stop();
    else start();
  };

  // Cleanup: stop any speech if the component unmounts (e.g. navigating away).
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    supported,
    active,
    playing,
    paused,
    rate,
    sentenceIndex,
    totalSentences,
    finished,
    flat,
    start,
    stop,
    toggle,
    togglePause,
    changeRate,
  };
}
