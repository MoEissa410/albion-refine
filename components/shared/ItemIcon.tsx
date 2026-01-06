"use client";

import React from "react";
import Image from "next/image";
import { getItemIcon } from "@/lib/search";

/**
 * SHARED COMPONENT: ITEM ICON
 *
 * Standardized icon renderer for Albion Online items.
 * Provides a premium glass-morphism container and optimized image loading.
 */

interface ItemIconProps {
  itemId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  autoAnimate?: boolean;
}

export function ItemIcon({
  itemId,
  size = "md",
  className = "",
  autoAnimate = false,
}: ItemIconProps) {
  // Size-to-dimensions mapping
  const sizeMap = {
    sm: { box: "w-8 h-8", img: 32, text: "text-[10px]" },
    md: { box: "w-12 h-12", img: 40, text: "text-xs" },
    lg: { box: "w-16 h-16", img: 56, text: "text-base" },
    xl: { box: "w-20 h-20", img: 72, text: "text-xl" },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`rounded-xl border border-primary/20 bg-primary/10 text-primary font-black flex items-center justify-center overflow-hidden shrink-0 
        ${currentSize.box} 
        ${currentSize.text}
        ${
          autoAnimate ? "hover:scale-110 transition-transform duration-500" : ""
        }
        ${className}`}
    >
      <Image
        src={getItemIcon(itemId)}
        alt={`Icon for ${itemId}`}
        width={currentSize.img}
        height={currentSize.img}
        className="object-cover p-1.5"
        loading="lazy"
        unoptimized // Albion CDN provides pre-generated icons
      />
    </div>
  );
}
