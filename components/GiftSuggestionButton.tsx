"use client";

import { Book, Gift } from "lucide-react";
import { useState } from "react";
import { type GiftSuggestionResult, suggestGift } from "@/actions/gift";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BookRecommendation } from "@/lib/types";

interface GiftSuggestionButtonProps {
  userId: string;
}

function RecommendationCard({ recommendation }: { recommendation: BookRecommendation }) {
  return (
    <Card className="border-border/30 bg-card/60">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-16 h-24 rounded overflow-hidden bg-muted/30">
            {recommendation.imageUrl ? (
              <img src={recommendation.imageUrl} alt={recommendation.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Book className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground leading-tight">{recommendation.title}</h4>
            <p className="text-sm text-muted-foreground">{recommendation.author}</p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {recommendation.genre}
              </Badge>
              {recommendation.year && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {recommendation.year}
                </Badge>
              )}
              {recommendation.pageCount && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {recommendation.pageCount} pages
                </Badge>
              )}
            </div>

            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{recommendation.reason}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Gift Recommendations
          </DialogTitle>
          <DialogDescription>
            {result?.fiveStarCount
              ? `Based on ${result.fiveStarCount} five-star rated books`
              : "Finding the perfect book gifts..."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <LoadingSpinner className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing reading preferences...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-3">
              {result.success && result.recommendations ? (
                result.recommendations.map((rec, index) => (
                  <RecommendationCard key={`${rec.title}-${index}`} recommendation={rec} />
                ))
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
