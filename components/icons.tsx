import type { CSSProperties } from "react";

export type IconName = "upload" | "frame" | "expand" | "slate" | "plus" | "check" | "flag" | "close" | "arrow" | "chevron" | "spark" | "activity" | "layers" | "play" | "refresh" | "image" | "terminal";
export function Icon({ name, size = 16, className = "", style }: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  const paths: Record<IconName, React.ReactNode> = {
    upload: <><path d="M12 16V3m-5 5 5-5 5 5"/><path d="M4 15v6h16v-6"/></>,
    frame: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><path d="M8 8h8v8H8z"/></>,
    expand: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/></>,
    slate: <><path d="M3 9h18v11H3zM3 9l-1-5 18-3 1 5zM7 3l4 4m3-5 4 4M3 14h18M8 14v6m8-6v6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    flag: <><path d="M5 21V4m0 0c5-5 9 5 14 0v10c-5 5-9-5-14 0"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/><path d="M20 2v4m-2-2h4"/></>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4"/>,
    layers: <><path d="m12 3 10 5-10 5L2 8zM3 13l9 5 9-5M3 18l9 5 9-5"/></>,
    play: <path d="m8 4 12 8-12 8z"/>,
    refresh: <><path d="M20 8A8 8 0 1 0 21 14M20 3v5h-5"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/></>,
    terminal: <><path d="m4 6 6 6-6 6m9 0h7"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>{paths[name]}</svg>;
}
