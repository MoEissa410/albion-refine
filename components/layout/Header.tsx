"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ModeToggle } from "../ui/mode-toggle";
import Image from "next/image";
import SearchBar from "../search/SearchBar";
import { Hammer as HammerIcon, TrendingUp as TrendingIcon } from "lucide-react";

/**
 * Global Header Component
 *
 * Includes the application logo, integrated SearchBar for both desktop and mobile,
 * and quick access to core features like Refining and Crafting.
 */

export default function Header() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-black/5 dark:border-white/10 p-3 sm:p-4 transition-all">
      <div className="wrapper flex items-center justify-between gap-4">
        {/* LOGO & BRANDING */}
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center justify-center  leading-none">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase opacity-70">
                Bright
              </span>
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 bg-primary rounded-xl flex items-center justify-center overflow-hidden group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-primary/30">
                <Image
                  src="/logo1.svg"
                  alt="Albion Market Logo"
                  width={30}
                  height={30}
                  className="object-contain w-10 h-10 sm:w-12 sm:h-12"
                  priority
                />
              </div>
              <span className="text-md sm:text-lg font-black text-primary uppercase tracking-tighter">
                4ams
              </span>
            </div>
          </div>
        </Link>

        {/* INTEGRATED SEARCH (Desktop Only) */}
        <div className="flex-1 max-w-lg hidden md:block">
          <SearchBar />
        </div>

        {/* NAVIGATION & ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <div className="hidden sm:flex items-center gap-1 sm:gap-3">
            <Link href="/refine">
              <Button
                variant="ghost"
                className="btn-ghost flex items-center gap-2 cursor-pointer"
              >
                <HammerIcon className="w-3.5 h-3.5" />
                <span>Refine</span>
              </Button>
            </Link>
            <Link href="/craft">
              <Button
                variant="ghost"
                className="btn-ghost flex items-center gap-2 cursor-pointer"
              >
                <TrendingIcon className="w-3.5 h-3.5" />
                <span>Craft</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 border-l border-black/10 dark:border-white/10 pl-2 sm:pl-4">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* MOBILE EXPERIENCE: Integrated Search & Quick Links */}
      <div className="mt-3 md:hidden space-y-3 px-1">
        <SearchBar />
        <div className="flex items-center justify-center gap-2 sm:hidden border-t border-black/5 dark:border-white/5 pt-3 mt-2">
          <Link href="/refine" className="flex-1">
            <Button
              variant="ghost"
              className="w-full text-[10px] font-black uppercase tracking-widest py-1 h-8 flex items-center justify-center gap-2 cursor-pointer"
            >
              <HammerIcon className="w-3 h-3" /> Refine
            </Button>
          </Link>
          <div className="w-px h-4 bg-black/5 dark:bg-white/10" />
          <Link href="/craft" className="flex-1">
            <Button
              variant="ghost"
              className="w-full text-[10px] font-black uppercase tracking-widest py-1 h-8 flex items-center justify-center gap-2 cursor-pointer"
            >
              <TrendingIcon className="w-3 h-3" /> Craft
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
