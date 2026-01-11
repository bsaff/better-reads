"use client";

import { User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RecentProfileCardProps {
  url: string;
  username?: string;
  onSelect: () => void;
}

export function RecentProfileCard({ url, username, onSelect }: RecentProfileCardProps) {
  return (
    <Card
      className="w-full max-w-lg border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer hover:bg-card/90 transition-colors"
      onClick={onSelect}
    >
      <CardContent className="p-4 py-2">
        <div className="flex items-center gap-3">
          <User className="size-6 text-muted-foreground stroke-amber-100" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {username ? `${username}'s Profile` : "Recent Profile"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{url}</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
