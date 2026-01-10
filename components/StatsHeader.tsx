import { Card, CardContent } from "@/components/ui/card";
import type { ProfileData } from "@/lib/types";

export function StatsHeader({ profile }: { profile: ProfileData }) {
  const rated = profile.books.filter((b) => b.myRating > 0);
  const avgRating = rated.length > 0 ? (rated.reduce((sum, b) => sum + b.myRating, 0) / rated.length).toFixed(1) : "0";
  const totalPages = profile.books.reduce((sum, b) => sum + (b.pages || 0), 0);
  const withReviews = profile.books.filter((b) => b.review).length;

  const stats = [
    { label: "Books", value: profile.totalBooks },
    { label: "Pages", value: totalPages.toLocaleString() },
    { label: "Avg Rating", value: `${avgRating}/5` },
    { label: "Reviews", value: withReviews },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/30 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
