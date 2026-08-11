"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  ArrowLeft,
  Check,
  X,
  Star,
  Video,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  PRIMARY_BTN,
  BRAND_FILL,
  PAGE_BG,
  HEADER,
  CARD,
  SkeletonCard,
  Spinner,
} from "./design-system";

interface Testimonial {
  id: string;
  status: string;
  customerName: string;
  customerTitle: string | null;
  customerCompany: string | null;
  rating: number | null;
  textContent: string | null;
  videoUrl: string | null;
  createdAt: string;
}

interface Space {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  themeColor: string;
  testimonials: Testimonial[];
}

export function SpaceDetailView() {
  const { view, setView } = useAppStore();
  const { toast } = useToast();
  const spaceId = view.page === "space" ? view.spaceId : "";
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const fetchSpace = useCallback(async () => {
    if (!spaceId) return;
    try {
      const res = await fetch(`/api/spaces/detail?id=${spaceId}`);
      const data = await res.json();
      if (res.ok) setSpace(data.space);
    } catch {
      toast({ title: "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [spaceId, toast]);

  useEffect(() => {
    fetchSpace();
  }, [fetchSpace]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/testimonials/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await fetchSpace();
        toast({ title: `Testimonial ${status}` });
      }
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/testimonials/update?id=${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSpace();
        toast({ title: "Testimonial deleted" });
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const embedCode = `<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/?wall=${space?.slug || ""}" width="100%" height="600" frameborder="0" style="border-radius:12px"></iframe>`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: `${label} copied` });
  };

  const pending = space?.testimonials.filter((t) => t.status === "pending") || [];
  const approved = space?.testimonials.filter((t) => t.status === "approved") || [];
  const rejected = space?.testimonials.filter((t) => t.status === "rejected") || [];

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  const TestimonialCard = ({ t, showActions }: { t: Testimonial; showActions: boolean }) => (
    <div className={CARD}>
      <div className="p-5 space-y-3">
        {/* Author row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
              style={{ backgroundColor: space?.themeColor || "#10b981" }}
              aria-hidden="true"
            >
              {t.customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{t.customerName}</p>
              {(t.customerTitle || t.customerCompany) && (
                <p className="text-xs text-muted-foreground">
                  {[t.customerTitle, t.customerCompany].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs gap-1 font-normal">
            {t.videoUrl ? <><Video className="h-3 w-3" /> Video</> : <><FileText className="h-3 w-3" /> Text</>}
          </Badge>
        </div>

        {/* Stars */}
        {renderStars(t.rating)}

        {/* Quote */}
        {t.textContent && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            &ldquo;{t.textContent}&rdquo;
          </p>
        )}

        {/* Video */}
        {t.videoUrl && (
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <video src={t.videoUrl} className="w-full max-h-36" controls preload="metadata" />
          </div>
        )}

        {/* Footer: date + actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {new Date(t.createdAt).toLocaleDateString()}
          </span>
          {showActions && (
            <div className="flex gap-1">
              {t.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleStatusUpdate(t.id, "approved")}
                  >
                    <Check className="h-3 w-3" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleStatusUpdate(t.id, "rejected")}
                  >
                    <X className="h-3 w-3" /> Reject
                  </Button>
                </>
              )}
              {t.status === "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => handleStatusUpdate(t.id, "approved")}
                >
                  <Check className="h-3 w-3" /> Approve
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                aria-label="Delete testimonial"
                onClick={() => setDeleteTarget(t)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${PAGE_BG}`}>
        <header className={HEADER}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Back to dashboard" onClick={() => setView({ page: "dashboard" })}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  if (!space) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${PAGE_BG}`}>
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-1">Space not found</h2>
          <p className="text-sm text-muted-foreground mb-4">It may have been deleted.</p>
          <Button variant="outline" onClick={() => setView({ page: "dashboard" })}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  const submitUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/?submit=${space.slug}`;

  return (
    <div className={`min-h-screen ${PAGE_BG}`}>
      {/* Header — same structure as dashboard */}
      <header className={HEADER}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Back to dashboard" onClick={() => setView({ page: "dashboard" })}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-semibold">{space.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setView({ page: "submit", slug: space.slug })}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Submit Page
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView({ page: "wall", slug: space.slug })}>
              <Heart className={`h-3.5 w-3.5 mr-1.5 ${BRAND_FILL}`} />
              Wall Preview
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-1.5">
              Pending
              {pending.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] text-[10px] px-1">
                  {pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1.5">
              Approved
              {approved.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] text-[10px] px-1">
                  {approved.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1.5">
              Rejected
              {rejected.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] text-[10px] px-1">
                  {rejected.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pending.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="No pending reviews"
                description="New submissions will appear here for approval"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pending.map((t) => <TestimonialCard key={t.id} t={t} showActions />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approved.length === 0 ? (
              <EmptyState
                icon={<Check className="h-6 w-6" />}
                title="No approved testimonials"
                description="Approve pending submissions to see them here"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {approved.map((t) => <TestimonialCard key={t.id} t={t} showActions={false} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejected.length === 0 ? (
              <EmptyState
                icon={<X className="h-6 w-6" />}
                title="No rejected testimonials"
                description="Rejected submissions will appear here"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {rejected.map((t) => <TestimonialCard key={t.id} t={t} showActions />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="embed">
            <div className="max-w-xl space-y-6">
              {/* Embed code */}
              <div className={CARD}>
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-semibold mb-1">Embed your Wall of Love</h2>
                    <p className="text-sm text-muted-foreground">
                      Paste this snippet into your site to display approved testimonials.
                    </p>
                  </div>
                  <CodeBlock
                    value={embedCode}
                    onCopy={() => handleCopy(embedCode, "Embed code")}
                    copied={copied}
                  />
                </div>
              </div>

              {/* Submit URL */}
              <div className={CARD}>
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-semibold mb-1">Share the submit page</h2>
                    <p className="text-sm text-muted-foreground">
                      Send this link to customers so they can leave a testimonial.
                    </p>
                  </div>
                  <CodeBlock
                    value={submitUrl}
                    onCopy={() => handleCopy(submitUrl, "Submit URL")}
                    copied={false}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete confirmation — replaces browser confirm() */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.customerName}&apos;s testimonial. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Shared sub-components ── */

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 px-6 text-center">
      <div className="text-gray-300 mx-auto mb-3">{icon}</div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function CodeBlock({ value, onCopy, copied }: { value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="relative">
      <Input readOnly value={value} className="pr-10 font-mono text-xs h-9" />
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        aria-label="Copy to clipboard"
        onClick={onCopy}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      {copied && (
        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-medium">
          Copied
        </span>
      )}
    </div>
  );
}
