import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { BookCard } from "@/components/BookCard";
import { GiftSuggestionButton } from "@/components/GiftSuggestionButton";
import { StatsHeader } from "@/components/StatsHeader";
import { getCachedProfile } from "@/lib/cache";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCachedProfile(id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-background to-background -z-10" />

      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-6">
            <BackLink />
          </div>

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">📚</span>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  {profile.userName ? `${profile.userName}'s Reading History` : "Reading History"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {profile.shelf} shelf • Synced {new Date(profile.scrapedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <GiftSuggestionButton userId={id} />
          </div>

          <StatsHeader profile={profile} />
        </header>

        {/* Books Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground/80">All Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.books.map((book) => (
              <BookCard key={book.bookId} book={book} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
