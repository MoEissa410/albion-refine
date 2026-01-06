"use client";

import React from "react";
import { ResourceType, useRefineStore } from "@/hooks/use-refine-store";
import { useIsFetching } from "@tanstack/react-query";

/**
 * REFINE HEADER COMPONENT
 *
 * Displays the page title and the active resource type indicator.
 * Also includes the global loading/syncing state bar.
 */
export function RefineHeader() {
  const resourceType = useRefineStore((state) => state.resourceType);

  // Track global sync status
  const isSyncing = useIsFetching({ queryKey: ["refine_prices"] }) > 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-6 relative overflow-hidden">
      {/* SYNC INDICATOR */}
      {isSyncing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 overflow-hidden">
          <div
            className="h-full bg-primary animate-progress-loading"
            style={{ width: "30%" }}
          />
        </div>
      )}

      {/* TITLE & DESCRIPTION */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Refining Calculator
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Optimize your refining profits with real-time market data
        </p>
      </div>

      {/* RESOURCE BADGE */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
          <span className="text-primary font-black text-xl uppercase tracking-tighter">
            {resourceType}
          </span>
        </div>
      </div>
    </div>
  );
}
