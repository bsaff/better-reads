"use client";

import { useState } from "react";
import { type ActionResult, get as loadProfile } from "@/actions/profile";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      const result: ActionResult = await loadProfile(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      // Redirect throws an error in Next.js, which is expected
      // If we catch something else, show a generic error
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        // This is expected, the redirect will happen
        return;
      }
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      {/* Subtle radial gradient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-background to-background -z-10" />

      <Card className="w-full max-w-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto text-6xl">📚</div>
          <CardTitle className="text-4xl tracking-tight" style={{ fontFamily: "var(--font-lora)" }}>
            Better Reads
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Paste your Goodreads profile URL to see your reading history in a beautiful format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                name="url"
                type="text"
                placeholder="https://www.goodreads.com/user/show/12345-username"
                className="h-12 text-base bg-input/50 border-border/50 placeholder:text-muted-foreground/50"
                disabled={loading}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Loading books...
                </span>
              ) : (
                "Load My Books"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              Find your profile URL at{" "}
              <a
                href="https://www.goodreads.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                goodreads.com
              </a>{" "}
              → Profile → Copy the URL
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
