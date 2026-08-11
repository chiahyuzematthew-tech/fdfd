"use client";

import { useEffect, useCallback } from "react";
import { useAppStore, View } from "@/lib/store";
import { AuthView } from "@/components/kudos/auth-view";
import { DashboardView } from "@/components/kudos/dashboard-view";
import { SpaceDetailView } from "@/components/kudos/space-detail-view";
import { SubmitView } from "@/components/kudos/submit-view";
import { WallOfLoveView } from "@/components/kudos/wall-of-love-view";

export default function Home() {
  const { user, view, setUser, setView, setLoading } = useAppStore();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [setUser, setLoading]);

  // Handle URL params for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wallSlug = params.get("wall");
    const submitSlug = params.get("submit");

    if (wallSlug) {
      setView({ page: "wall", slug: wallSlug });
    } else if (submitSlug) {
      setView({ page: "submit", slug: submitSlug });
    }
  }, [setView]);

  // Sync view to URL
  const updateURL = useCallback((view: View) => {
    const params = new URLSearchParams();
    if (view.page === "wall") params.set("wall", view.slug);
    if (view.page === "submit") params.set("submit", view.slug);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
  }, []);

  useEffect(() => {
    updateURL(view);
  }, [view, updateURL]);

  // Auto-redirect: if user is logged in and on auth page, go to dashboard
  useEffect(() => {
    if (user && view.page === "auth") {
      setView({ page: "dashboard" });
    }
    if (!user && view.page !== "auth" && view.page !== "wall" && view.page !== "submit") {
      setView({ page: "auth", mode: "login" });
    }
  }, [user, view, setView]);

  // Render current view
  const renderView = () => {
    switch (view.page) {
      case "auth":
        return <AuthView />;
      case "dashboard":
        return <DashboardView />;
      case "space":
        return <SpaceDetailView />;
      case "submit":
        return <SubmitView />;
      case "wall":
        return <WallOfLoveView />;
      default:
        return <AuthView />;
    }
  };

  return <>{renderView()}</>;
}
