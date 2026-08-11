"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      toast({ title: "Error", description: "Failed to load spaces", variant: "destructive" });
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
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }
      setSpaces((prev) => [data.space, ...prev]);
      setCreateOpen(false);
      setNewName("");
      setNewHeadline("");
      toast({ title: "Space created!", description: `"${data.space.name}" is ready` });
    } catch {
      toast({ title: "Error", description: "Failed to create space", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its testimonials?`)) return;
    try {
      const res = await fetch(`/api/spaces/detail?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSpaces((prev) => prev.filter((s) => s.id !== id));
        toast({ title: "Deleted", description: `"${name}" removed` });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setView({ page: "auth", mode: "login" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-emerald-500 fill-emerald-500" />
            <span className="text-xl font-bold tracking-tight">Kudos</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Spaces</h1>
            <p className="text-muted-foreground mt-1">
              Create spaces to collect and showcase testimonials
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Space
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new Space</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Space Name</label>
                  <Input
                    placeholder="e.g. My SaaS Product"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Headline</label>
                  <Input
                    placeholder="e.g. See what our customers say"
                    value={newHeadline}
                    onChange={(e) => setNewHeadline(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                >
                  {creating ? "Creating..." : "Create Space"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {spaces.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No spaces yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first space to start collecting testimonials
              </p>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Space
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <Card
                key={space.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm"
                onClick={() => setView({ page: "space", spaceId: space.id })}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: space.themeColor }}
                      />
                      <CardTitle className="text-lg">{space.name}</CardTitle>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setView({ page: "wall", slug: space.slug });
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(space.id, space.name);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {space.headline && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {space.headline}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {space._count?.testimonials || 0} testimonial{(space._count?.testimonials || 0) !== 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono">
                      {space.slug}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
