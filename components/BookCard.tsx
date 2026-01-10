import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Book } from "@/lib/types";
import { StarRating } from "./StarRating";

export function BookCard({ book }: { book: Book }) {
  const dateRead = book.dateRead
    ? new Date(book.dateRead).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Card className="group overflow-hidden border-border/30 bg-card/60 hover:bg-card/80 transition-all duration-300 hover:border-primary/30">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Book Cover */}
          <div className="flex-shrink-0 w-20 h-28 rounded overflow-hidden bg-muted/30">
            {book.imageUrl ? (
              <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No cover
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <h3
              className="font-medium text-foreground leading-tight line-clamp-2"
              style={{ fontFamily: "var(--font-lora)" }}
            >
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{book.author}</p>

            <div className="flex items-center gap-2 mt-auto">
              {book.myRating > 0 && <StarRating rating={book.myRating} />}
              {dateRead && <span className="text-xs text-muted-foreground">{dateRead}</span>}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-1">
              {book.pages && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {book.pages} pages
                </Badge>
              )}
              {book.yearPublished && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {book.yearPublished}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Review (if exists) */}
        {book.review && (
          <div className="px-4 pb-4">
            <div className="text-sm text-muted-foreground/80 line-clamp-3 italic border-l-2 border-primary/30 pl-3">
              "{book.review}"
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
