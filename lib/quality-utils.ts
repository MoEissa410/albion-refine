export type QualityStyle = {
  text: string;
  bg: string;
  border: string;
  hoverBg: string; // Specific hover state for interactive elements
  ring?: string; // For focus/selection states
};

export const QUALITY_COLORS: Record<number, QualityStyle> = {
  // Normal (1) -> Caerleon Style (Zinc/Gray/Dark)
  1: {
    text: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-100 dark:bg-zinc-800/50",
    border: "border-zinc-200 dark:border-zinc-700",
    hoverBg: "hover:bg-zinc-200 dark:hover:bg-zinc-700",
    ring: "ring-zinc-400",
  },
  // Good (2) -> Standard/Common (Greenish but distinct from Tier/City colors? Or maybe Blue?)
  // User asked for "Good" but didn't specify color. Let's go with a clean Blue (Runescape style or similar RPG standard)
  2: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    hoverBg: "hover:bg-blue-200 dark:hover:bg-blue-800/40",
    ring: "ring-blue-400",
  },
  // Outstanding (3) -> Bridgewatch Style (Amber/Orange)
  3: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    hoverBg: "hover:bg-amber-200 dark:hover:bg-amber-800/40",
    ring: "ring-amber-400",
  },
  // Excellent (4) -> Platinum (Slate/Cool Gray/Metallic)
  4: {
    text: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-300 dark:border-slate-600",
    hoverBg: "hover:bg-slate-200 dark:hover:bg-slate-700",
    ring: "ring-slate-400",
  },
  // Masterpiece (5) -> Gold (Yellow/Yellow-500)
  5: {
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    hoverBg: "hover:bg-yellow-200 dark:hover:bg-yellow-800/40",
    ring: "ring-yellow-400",
  },
};

const DEFAULT_QUALITY_STYLE: QualityStyle = {
  text: "text-muted-foreground",
  bg: "bg-muted",
  border: "border-border",
  hoverBg: "hover:bg-muted/80",
};

export function getQualityStyle(quality: number): QualityStyle {
  return QUALITY_COLORS[quality] || DEFAULT_QUALITY_STYLE;
}
