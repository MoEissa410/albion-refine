export type CityStyle = {
  text: string;
  bg: string;
  border: string;
  gradient?: string;
  iconColor?: string;
};

export const CITY_COLORS: Record<string, CityStyle> = {
  Lymhurst: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  Bridgewatch: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  Martlock: {
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  Thetford: {
    text: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  "Fort Sterling": {
    text: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    iconColor: "text-sky-600 dark:text-sky-300",
  },
  Caerleon: {
    text: "text-zinc-800 dark:text-zinc-400",
    bg: "bg-zinc-500/10 hover:bg-zinc-500/20",
    border: "border-zinc-500/20",
    iconColor: "text-zinc-700 dark:text-zinc-300",
  },
  Brecilien: {
    text: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    gradient:
      "bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent",
    iconColor: "text-indigo-500",
  },
};

const DEFAULT_STYLE: CityStyle = {
  text: "text-muted-foreground",
  bg: "bg-muted/50",
  border: "border-border",
  iconColor: "text-muted-foreground",
};

export function getCityStyle(city: string): CityStyle {
  return CITY_COLORS[city] || DEFAULT_STYLE;
}
