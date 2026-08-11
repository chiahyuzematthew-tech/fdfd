"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const fetchSpace = useCallback(async () => {
    if (!spaceId) return;
    try {
      const res = await fetch(`/api/spaces/detail?id=${spaceId}`);
      const data = await res.json();
      if (res.ok) setSpace(data.space);
    } catch {
      toast({ title: "Error", description: "Failed to load space", variant: "destructive" });
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
        toast({ title: `Testimonial ${status}`, description: "Status updated" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials/update?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSpace();
        toast({ title: "Deleted" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const embedCode = `<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/?wall=${space?.slug || ""}" width="100%" height="600" frameborder="0" style="border-radius:12px"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Embed code copied to clipboard" });
  };

  const pending = space?.testimonials.filter((t) => t.status === "pending") || [];
  const approved = space?.testimonials.filter((t) => t.status === "approved") || [];
  const rejected = space?.testimonials.filter((t) => t.status === "rejected") || [];

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
          />
        ))}
      </div>
    );
  };

  const TestimonialCard = ({ t, showActions }: { t: Testimonial; showActions: boolean }) => (
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
                {t.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{t.customerName}</p>
                {(t.customerTitle || t.customerCompany) && (
                  <p className="text-xs text-muted-foreground">
                    {t.customerTitle}
                    {t.customerTitle && t.customerCompany && " at "}
                    {t.customerCompany}
                  </p>
                )}
              </div>
            </div>
            {renderStars(t.rating)}
          </div>
          <div className="flex items-center gap-1">
            {t.videoUrl ? (
              <Badge variant="outline" className="text-xs gap-1">
                <Video className="h-3 w-3" /> Video
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs gap-1">
                <FileText className="h-3 w-3" /> Text
              </Badge>
            )}
          </div>
        </div>

        {t.textContent && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-4">
            &ldquo;{t.textContent}&rdquo;
          </p>
        )}

        {t.videoUrl && (
          <div className="mb-3 rounded-lg overflow-hidden bg-black/5">
            <video
              src={t.videoUrl}
              className="w-full max-h-40"
              controls
              preload="metadata"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
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
                    className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleStatusUpdate(t.id, "approved")}
                  >
                    <Check className="h-3 w-3 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => handleStatusUpdate(t.id, "rejected")}
                  >
                    <X className="h-3 w-3 mr-1" /> Reject
                  </Button>
                </>
              )}
              {t.status === "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-emerald-600"
                  onClick={() => handleStatusUpdate(t.id, "approved")}
                >
                  <Check className="h-3 w-3 mr-1" /> Approve
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Space not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView({ page: "dashboard" })}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{space.name}</h1>
              <p className="text-xs text-muted-foreground font-mono">{space.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView({ page: "submit", slug: space.slug })}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Submit Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView({ page: "wall", slug: space.slug })}
            >
              <Heart className="h-3.5 w-3.5 mr-1.5" />
              Wall Preview
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-1.5">
              Pending
              {pending.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                  {pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1.5">
              Approved
              {approved.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                  {approved.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1.5">
              Rejected
              {rejected.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                  {rejected.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pending.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending testimonials</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share your submit page to start collecting
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pending.map((t) => (
                  <TestimonialCard key={t.id} t={t} showActions />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approved.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No approved testimonials yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {approved.map((t) => (
                  <TestimonialCard key={t.id} t={t} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejected.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No rejected testimonials</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {rejected.map((t) => (
                  <TestimonialCard key={t.id} t={t} showActions />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="embed">
            <div className="max-w-2xl space-y-6">
              <Card className="shadow-sm border-0">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Embed Your Wall of Love</h3>
                  <p className="text-sm text-muted-foreground">
                    Copy this code and paste it into your website to display your testimonials.
                  </p>
                  <div className="relative">
                    <Input
                      readOnly
                      value={embedCode}
                      className="pr-12 font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                      onClick={handleCopy}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-xs text-emerald-600">Copied to clipboard!</p>
                  )}
                  <div className="pt-2 space-y-2">
                    <h4 className="text-sm font-medium">Submit Page URL</h4>
                    <div className="relative">
                      <Input
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/?submit=${space.slug}`}
                        className="pr-12 font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/?submit=${space.slug}`
                          );
                          toast({ title: "Copied!" });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
