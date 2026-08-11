"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Heart, Star, Video, MessageSquare, PenLine, ArrowLeft } from "lucide-react";
import { BRAND_FILL, PAGE_BG, HEADER, CARD, SkeletonCard } from "./design-system";

interface Testimonial {
  id: string;
  customerName: string;
  customerTitle: string | null;
  customerCompany: string | null;
  rating: number | null;
  textContent: string | null;
  videoUrl: string | null;
  createdAt: string;
}

interface WallSpace {
  id: string;
  name: string;
  headline: string | null;
  themeColor: string;
  testimonials: Testimonial[];
}

export function WallOfLoveView() {
  const { view, setView } = useAppStore();
  const slug = view.page === "wall" ? view.slug : "";

  const [space, setSpace] = useState<WallSpace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWall = async () => {
      try {
        const res = await fetch(`/api/wall?slug=${slug}`);
        const data = await res.json();
        if (res.ok) setSpace(data.space);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchWall();
  }, [slug]);

  // Loading state — skeleton grid
  if (loading) {
    return (
      <div className={`min-h-screen bg-white`}>
        <header className={HEADER}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Heart className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold mb-1">Wall not found</h2>
          <p className="text-sm text-muted-foreground">This wall doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const testimonials = space.testimonials;

  return (
    <div className="min-h-screen bg-white">
      {/* Header — consistent h-14 */}
      <header className={HEADER}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Go to sign in" onClick={() => setView({ page: "auth", mode: "login" })}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Heart className={`h-5 w-5 ${BRAND_FILL}`} />
            <span className="text-sm font-medium">{space.name}</span>
          </div>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => setView({ page: "submit", slug })}
          >
            <PenLine className="h-3.5 w-3.5 mr-1.5" />
            Add yours
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Headline — one clear message, not competing with anything */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2"
            style={{ color: space.themeColor }}
          >
            {space.headline || "Wall of Love"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Real feedback from real customers
          </p>
        </div>

        {/* Testimonials or empty state */}
        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold mb-1">No testimonials yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Be the first to share your experience.</p>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => setView({ page: "submit", slug })}
            >
              <PenLine className="h-3.5 w-3.5 mr-1.5" />
              Add yours
            </Button>
          </div>
        ) : (
          <MasonryGrid testimonials={testimonials} themeColor={space.themeColor} />
        )}
      </main>

      {/* Footer — subtle, not shouting */}
      <footer className="border-t py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
            Powered by
            <Heart className={`h-3 w-3 ${BRAND_FILL}`} />
            <span className="font-medium">Kudos</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Masonry layout — 3 columns on desktop, 2 on tablet, 1 on mobile ── */

function MasonryGrid({ testimonials, themeColor }: { testimonials: Testimonial[]; themeColor: string }) {
  const columns: Testimonial[][] = [[], [], []];
  testimonials.forEach((t, i) => columns[i % 3].push(t));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="space-y-4">
          {col.map((t) => <WallCard key={t.id} testimonial={t} themeColor={themeColor} />)}
        </div>
      ))}
    </div>
  );
}

/* ── Wall card — consistent with design system ── */

function WallCard({ testimonial: t, themeColor }: { testimonial: Testimonial; themeColor: string }) {
  return (
    <div className={`${CARD} p-5`}>
      {/* Stars — only if present */}
      {t.rating && (
        <div className="flex gap-0.5 mb-2.5" aria-label={`${t.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i <= t.rating! ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Quote */}
      {t.textContent && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          &ldquo;{t.textContent}&rdquo;
        </p>
      )}

      {/* Video */}
      {t.videoUrl && (
        <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
          <video src={t.videoUrl} className="w-full" controls preload="metadata" />
        </div>
      )}

      {/* Author — always visible, consistent avatar style */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
          style={{ backgroundColor: themeColor }}
          aria-hidden="true"
        >
          {t.customerName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{t.customerName}</p>
          {(t.customerTitle || t.customerCompany) && (
            <p className="text-xs text-muted-foreground truncate">
              {[t.customerTitle, t.customerCompany].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
