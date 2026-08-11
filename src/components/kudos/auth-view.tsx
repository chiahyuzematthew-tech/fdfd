"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AuthView() {
  const { view, setView, setUser } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLogin = view.page === "auth" && view.mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }

      setUser(data.user);
      setView({ page: "dashboard" });
      toast({ title: isLogin ? "Welcome back!" : "Account created!", description: "You're now signed in." });
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-emerald-500 fill-emerald-500" />
            <span className="text-3xl font-bold tracking-tight">Kudos</span>
          </div>
          <p className="text-muted-foreground">
            Collect & showcase testimonials that sell
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to continue"
                : "Get started with Kudos in seconds"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={submitting}
              >
                {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="text-emerald-600 hover:text-emerald-700 font-medium underline-offset-4 hover:underline"
                onClick={() =>
                  setView({
                    page: "auth",
                    mode: isLogin ? "register" : "login",
                  })
                }
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
            onClick={async () => {
              try {
                const res = await fetch("/api/seed", { method: "POST" });
                const data = await res.json();
                if (res.ok) {
                  toast({
                    title: "Demo data seeded!",
                    description: `Login: ${data.user?.email} / ${data.user?.password}`,
                  });
                }
              } catch {
                toast({ title: "Error", description: "Failed to seed demo data", variant: "destructive" });
              }
            }}
          >
            Or try with demo data →
          </button>
        </div>
      </div>
    </div>
  );
}
