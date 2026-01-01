"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/search";

interface RelativeTimeProps {
  dateString: string;
}

/**
 * RE-SAFE RELATIVE TIME COMPONENT
 *
 * FIXES HYDRATION MISMATCH ERRORS:
 * Calculating "X hours ago" on the server is dangerous because the server's
 * timezone/clock may differ from the user's (especially with VPNs).
 *
 * This component handles calculation strictly on the client (browser) using useEffect.
 */
export default function RelativeTime({ dateString }: RelativeTimeProps) {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    // We only calculate this after the component mounts in the browser.
    // This ensures the Server HTML matches the Client HTML during initial load.
    setFormattedTime(formatRelativeTime(dateString));

    // AUTO-REFRESH: Keep the time updated every minute without page reloads.
    const interval = setInterval(() => {
      setFormattedTime(formatRelativeTime(dateString));
    }, 60000);

    return () => clearInterval(interval);
  }, [dateString]);

  // We return a placeholder (dots) until the client calculation is ready.
  return <span>{formattedTime || "..."}</span>;
}
