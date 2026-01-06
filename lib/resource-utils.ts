import { ResourceType } from "@/hooks/use-refine-store";

export type ResourceStyle = {
  text: string;
  bg: string;
  glow: string;
};

export const RESOURCE_STYLES: Record<ResourceType, ResourceStyle> = {
  WOOD: {
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-500",
    glow: "bg-green-500/20",
  },
  ORE: {
    text: "text-zinc-500 dark:text-zinc-400",
    bg: "bg-zinc-500",
    glow: "bg-zinc-500/20",
  },
  FIBER: {
    text: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-500",
    glow: "bg-sky-500/20",
  },
  HIDE: {
    text: "text-orange-700 dark:text-orange-500",
    bg: "bg-orange-700",
    glow: "bg-orange-700/20",
  },
  STONE: {
    text: "text-stone-500 dark:text-stone-400",
    bg: "bg-stone-500",
    glow: "bg-stone-500/20",
  },
};

export function getResourceStyle(type: ResourceType): ResourceStyle {
  return (
    RESOURCE_STYLES[type] || {
      text: "text-muted-foreground",
      bg: "bg-primary/40",
      glow: "bg-primary/20",
    }
  );
}
