"use client";

import { Loader2 } from "lucide-react";

/*
 * DESIGN SYSTEM — Kudos
 *
 * WHY these choices exist:
 *
 * SPACING: 4px base unit. Page sections use py-8 (32px).
 *   Stacks use space-y-6 (24px). Cards use p-5 (20px).
 *   This creates clear separation without arbitrary gaps.
 *
 * TYPOGRAPHY: One font (Geist Sans). Two weights: semibold (600)
 *   for headings, medium (500) for labels. Body is regular (400).
 *   This keeps hierarchy clear without weight chaos.
 *
 * COLORS: Emerald-500 is the sole brand color. It's used for
 *   primary actions and the logo. Gray-50 is the page background
 *   (not gradients — they add visual noise with no purpose).
 *   Amber-400 for stars (high contrast on white).
 *
 * CARDS: Always rounded-xl + border-gray-100 + white bg.
 *   shadow-sm by default, shadow-md on hover for interactive cards.
 *   No border-0 shadow-xl — that's inconsistent with the system.
 *
 * BUTTONS: Three variants only — primary (emerald), secondary
 *   (outline), ghost. Icon buttons always have aria-label.
 *
 * HEADERS: Always h-14, white/80 backdrop-blur, sticky top-0.
 *   Same structure on every page so navigation feels consistent.
 */

// Shared class constants
export const BRAND = "text-emerald-500";
export const BRAND_FILL = "text-emerald-500 fill-emerald-500";
export const PRIMARY_BTN = "bg-emerald-500 hover:bg-emerald-600 text-white";
export const PAGE_BG = "bg-gray-50/40";
export const HEADER = "border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50";
export const CARD = "rounded-xl border border-gray-100 bg-white";
export const CARD_INTERACTIVE =
  "rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer";

// Spinner for loading states
export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

// Skeleton loader for content placeholders
export function SkeletonBlock() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-2.5 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
  );
}
