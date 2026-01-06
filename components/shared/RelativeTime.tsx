"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/search";

/**
 * SHARED COMPONENT: RELATIVE TIME
 *
 * Displays a timestamp in a human-readable format (e.g., "15 minutes ago").
 *
 * DESIGN RATIONALE (Hydration Mismatch Prevention):
 * Calculating relative time on the server leads to hydration mismatches because
 * the server's clock and the client's clock (browser) are rarely perfectly in sync.
 * This component handles calculation strictly on the client after mount.
 */

interface RelativeTimeProps {
  dateString: string;
}

export default function RelativeTime({ dateString }: RelativeTimeProps) {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    // Mount-safe update function
    const update = () => {
      setFormattedTime(formatRelativeTime(dateString));
    };

    // Initial run on mount
    update();

    // AUTO-REFRESH: Keep the time live every 60s
    const interval = setInterval(update, 60000);

    return () => clearInterval(interval);
  }, [dateString]);

  // Render a placeholder until the client calculation is ready
  return <span className="font-medium">{formattedTime || "recently"}</span>;
}
