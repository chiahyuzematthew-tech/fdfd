"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Heart, Star, Video, MessageSquare, PenLine, ArrowLeft } from "lucide-react";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-muted-foreground">Loading wall...</div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Wall not found</h2>
          <p className="text-muted-foreground">This wall doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const testimonials = space.testimonials;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/20 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView({ page: "auth", mode: "login" })}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Heart className="h-5 w-5 text-emerald-500 fill-emerald-500" />
            <span className="font-semibold">{space.name}</span>
          </div>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => setView({ page: "submit", slug })}
          >
            <PenLine className="h-3.5 w-3.5 mr-1.5" />
            Add Yours
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight mb-4"
            style={{ color: space.themeColor }}
          >
            {space.headline || "Wall of Love"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Hear from the people who use and love our product
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No testimonials yet</h3>
            <p className="text-muted-foreground">Be the first to share your experience!</p>
          </div>
        ) : (
          <MasonryGrid testimonials={testimonials} themeColor={space.themeColor} />
        )}
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            Powered by
            <Heart className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
            <span className="font-medium">Kudos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MasonryGrid({
  testimonials,
  themeColor,
}: {
  testimonials: Testimonial[];
  themeColor: string;
}) {
  const columns: Testimonial[][] = [[], [], []];

  testimonials.forEach((t, i) => {
    columns[i % 3].push(t);
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="space-y-4 sm:space-y-5">
          {col.map((t) => (
            <WallCard key={t.id} testimonial={t} themeColor={themeColor} />
          ))}
        </div>
      ))}
    </div>
  );
}

function WallCard({
  testimonial: t,
  themeColor,
}: {
  testimonial: Testimonial;
  themeColor: string;
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-shadow duration-200">
      {/* Stars */}
      {t.rating && (
        <div className="flex gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i <= t.rating!
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>
      )}

      {/* Text */}
      {t.textContent && (
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
          &ldquo;{t.textContent}&rdquo;
        </p>
      )}

      {/* Video */}
      {t.videoUrl && (
        <div className="mb-4 rounded-lg overflow-hidden bg-black/5">
          <video
            src={t.videoUrl}
            className="w-full"
            controls
            preload="metadata"
          />
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0"
          style={{ backgroundColor: themeColor }}
        >
          {t.customerName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{t.customerName}</p>
          {(t.customerTitle || t.customerCompany) && (
            <p className="text-xs text-muted-foreground truncate">
              {t.customerTitle}
              {t.customerTitle && t.customerCompany && " · "}
              {t.customerCompany}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
