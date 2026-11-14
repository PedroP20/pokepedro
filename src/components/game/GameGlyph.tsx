import type { CSSProperties, ReactNode } from "react";

export type GameGlyphName = "play" | "target" | "learn" | "versus" | "bolt" | "crown" | "sound" | "image" | "keyboard" | "check" | "arrow" | "flag" | "exit";

const paths: Record<GameGlyphName, ReactNode> = {
  play: <path d="m9 5 11 7-11 7V5Z" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  learn: <><path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v14c-4-1-6 0-9 2-3-2-5-3-9-2V4Z" /><path d="M6 8h2M16 8h2" /></>,
  versus: <><path d="m4 3 7 7-3 3-7-7 3-3Zm16 0-7 7 3 3 7-7-3-3ZM7 14l-4 7m14-7 4 7M3 15l6 4m6 0 6-4" /></>,
  bolt: <path d="m14 2-10 12h7l-1 8 10-12h-7l1-8Z" />,
  crown: <><path d="m3 6 5 5 4-7 4 7 5-5-2 12H5L3 6ZM6 21h12" /></>,
  sound: <><path d="M3 9h4l5-4v14l-5-4H3V9Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8" cy="8" r="1" /><path d="m3 17 6-6 4 4 3-3 5 5" /></>,
  keyboard: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1M8 16h8" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  flag: <path d="M5 22V3c5-4 9 4 14 0v11c-5 4-9-4-14 0" />,
  exit: <><path d="M10 4H4v16h6m4-12 4 4-4 4m-6-4h13" /></>,
};

export default function GameGlyph({ name, style }: { name: GameGlyphName; style?: CSSProperties }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
