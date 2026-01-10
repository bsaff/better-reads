import type OpenAI from "openai";
import { fetchBookCover } from "@/lib/openLibrary";
import type { Book, BookRecommendation } from "@/lib/types";

const MAX_BOOKS_FOR_PROMPT = 50;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function formatBooksForPrompt(books: Book[]): string {
  return books
    .map((book) => {
      let entry = `- "${book.title}" by ${book.author}`;
      if (book.description) {
        entry += `\n  Description: ${book.description}`;
      }
      if (book.yearPublished) {
        entry += ` (${book.yearPublished})`;
      }
      return entry;
    })
    .join("\n\n");
}

export function buildGiftPrompt(booksContext: string): string {
  return `You are a thoughtful book recommender helping someone find the perfect book gift for a friend.

This reader has rated the following books 5 stars (their absolute favorites):

${booksContext}

Based on their taste, recommend FIVE specific books that would make great gifts. Each book should:
1. NOT be one they've already read (listed above)
2. Match their apparent preferences in genre, style, and themes
3. Be a well-regarded book that makes a thoughtful gift

Respond with a JSON object in this exact format:
{
  "recommendations": [
    {
      "title": "Book Title",
      "author": "Author Name",
      "year": 2020,
      "genre": "Fiction / Mystery / etc.",
      "pageCount": 350,
      "reason": "A brief 1-2 sentence explanation of why this would be perfect for them."
    }
  ]
}

Include all 5 recommendations in the array. Use null for year or pageCount if unknown.`;
}

export function filterFiveStarBooks(books: Book[]): Book[] {
  const fiveStars = books.filter((book) => book.myRating === 5);
  const shuffled = shuffleArray(fiveStars);
  return shuffled.slice(0, MAX_BOOKS_FOR_PROMPT);
}

export async function generateGiftRecommendation(books: Book[], openaiClient: OpenAI): Promise<BookRecommendation[]> {
  const booksContext = formatBooksForPrompt(books);
  const prompt = buildGiftPrompt(booksContext);

  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1500,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Failed to generate recommendations");
  }

  const parsed = JSON.parse(content) as { recommendations: Omit<BookRecommendation, "imageUrl">[] };

  if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
    throw new Error("Invalid response format");
  }

  // Fetch cover images in parallel
  const enriched = await Promise.all(
    parsed.recommendations.map(async (rec) => ({
      ...rec,
      imageUrl: await fetchBookCover(rec.title, rec.author),
    })),
  );

  return enriched;
}
