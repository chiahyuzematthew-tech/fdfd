"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, Plus, ExternalLink, MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  PRIMARY_BTN,
  BRAND_FILL,
  PAGE_BG,
  HEADER,
  CARD_INTERACTIVE,
  SkeletonCard,
  Spinner,
} from "./design-system";

interface Space {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  themeColor: string;
  createdAt: string;
  _count?: { testimonials: number };
}

export function DashboardView() {
  const { user, setView, setUser } = useAppStore();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchSpaces = useCallback(async () => {
    try {
      const res = await fetch("/api/spaces");
      if (res.status === 401) {
        setUser(null);
        setView({ page: "auth", mode: "login" });
        return;
      }
      const data = await res.json();
      setSpaces(data.spaces || []);
    } catch {
      toast({ title: "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [setUser, setView, toast]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, headline: newHeadline }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error, variant: "destructive" });
        return;
      }
      setSpaces((prev) => [data.space, ...prev]);
      setCreateOpen(false);
      setNewName("");
      setNewHeadline("");
      toast({ title: "Space created" });
    } catch {
      toast({ title: "Failed to create", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}" and all its testimonials?`)) return;
    try {
      const res = await fetch(`/api/spaces/detail?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSpaces((prev) => prev.filter((s) => s.id !== id));
        toast({ title: "Space deleted" });
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setView({ page: "auth", mode: "login" });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`min-h-screen ${PAGE_BG}`}>
        <header className={HEADER}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className={`h-5 w-5 ${BRAND_FILL}`} />
              <span className="text-base font-semibold tracking-tight">Kudos</span>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${PAGE_BG}`}>
      {/* Header — consistent across all authenticated views */}
      <header className={HEADER}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className={`h-5 w-5 ${BRAND_FILL}`} />
            <span className="text-base font-semibold tracking-tight">Kudos</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading + primary action */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your Spaces</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Each space is a testimonial wall you can embed on your site
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className={PRIMARY_BTN}>
                <Plus className="h-4 w-4 mr-1.5" />
                New Space
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">New Space</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="space-name" className="text-sm">Name</Label>
                  <Input
                    id="space-name"
                    placeholder="e.g. Acme Product"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="space-headline" className="text-sm">Headline</Label>
                  <Input
                    id="space-headline"
                    placeholder="e.g. What our customers say"
                    value={newHeadline}
                    onChange={(e) => setNewHeadline(e.target.value)}
                  />
                </div>
                <Button
                  className={`w-full ${PRIMARY_BTN}`}
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                >
                  {creating && <Spinner className="h-4 w-4 mr-1.5" />}
                  {creating ? "Creating…" : "Create Space"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content — empty state or grid */}
        {spaces.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 px-6 text-center">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-4" />
            <h2 className="text-base font-semibold mb-1">No spaces yet</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Create a space to start collecting testimonials
            </p>
            <Button className={PRIMARY_BTN} onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Space
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <Card
                key={space.id}
                className={CARD_INTERACTIVE}
                onClick={() => setView({ page: "space", spaceId: space.id })}
                role="button"
                tabIndex={0}
                aria-label={`Open ${space.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setView({ page: "space", spaceId: space.id });
                }}
              >
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: space.themeColor }}
                        aria-hidden="true"
                      />
                      <CardTitle className="text-base font-semibold">{space.name}</CardTitle>
                    </div>
                    {/* Hover actions — accessible via aria-label */}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Preview wall"
                        onClick={(e) => {
                          e.stopPropagation();
                          setView({ page: "wall", slug: space.slug });
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="Delete space"
                        onClick={(e) => handleDelete(e, space.id, space.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0">
                  {space.headline && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                      {space.headline}
                    </p>
                  )}
                  <Badge variant="secondary" className="text-xs font-normal">
                    {space._count?.testimonials || 0} testimonial{(space._count?.testimonials || 0) !== 1 ? "s" : ""}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
