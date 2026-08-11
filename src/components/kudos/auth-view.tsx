"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PRIMARY_BTN, BRAND_FILL, PAGE_BG } from "./design-system";

export function AuthView() {
  const { view, setView, setUser } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLogin = view.page === "auth" && view.mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { email, name, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setUser(data.user);
      setView({ page: "dashboard" });
      toast({ title: isLogin ? "Welcome back" : "Account created" });
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${PAGE_BG} p-4`}>
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Heart className={`h-5 w-5 ${BRAND_FILL}`} />
            <span className="text-base font-semibold tracking-tight">Kudos</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Collect and showcase customer testimonials
          </p>
        </div>

        {/* Auth card */}
        <Card className="rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-semibold">
              {isLogin ? "Sign in" : "Create account"}
            </CardTitle>
            <CardDescription className="text-sm">
              {isLogin ? "Enter your email and password" : "Set up your account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-9"
                />
              </div>

              {/* Inline error */}
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className={`w-full h-9 ${PRIMARY_BTN}`}
                disabled={submitting}
              >
                {submitting ? "Signing in…" : isLogin ? "Sign in" : "Create account"}
                {!submitting && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
              </Button>
            </form>

            {/* Toggle */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {isLogin ? "No account? " : "Have an account? "}
              <button
                type="button"
                className="text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-sm"
                onClick={() =>
                  setView({ page: "auth", mode: isLogin ? "register" : "login" })
                }
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>

        {/* Demo data link */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          <button
            type="button"
            className="hover:text-emerald-600 transition-colors underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-sm"
            onClick={async () => {
              try {
                const res = await fetch("/api/seed", { method: "POST" });
                const data = await res.json();
                if (res.ok) {
                  toast({
                    title: "Demo data ready",
                    description: `Login: ${data.user?.email} / ${data.user?.password}`,
                  });
                }
              } catch {
                toast({ title: "Seeding failed", variant: "destructive" });
              }
            }}
          >
            Load demo data
          </button>
        </p>
      </div>
    </div>
  );
}
