"use client";

import { Gift } from "lucide-react";
import { useState } from "react";
import { type GiftSuggestionResult, suggestGift } from "@/actions/gift";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GiftSuggestionButtonProps {
  userId: string;
}

export function GiftSuggestionButton({ userId }: GiftSuggestionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GiftSuggestionResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await suggestGift(userId);
      setResult(response);
    } catch {
      setResult({ success: false, error: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !result && !isLoading) {
      handleClick();
    }
    if (!open) {
      setResult(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Gift className="h-4 w-4" />
          <span className="hidden sm:inline">Suggest a Gift</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Gift Recommendation
          </DialogTitle>
          <DialogDescription>
            {result?.fiveStarCount
              ? `Based on ${result.fiveStarCount} five-star rated books`
              : "Finding the perfect book gift..."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <LoadingSpinner className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing reading preferences...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4">
              {result.success && result.recommendation ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{result.recommendation}</div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-destructive">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
