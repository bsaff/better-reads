import type OpenAI from "openai";
import { fetchBookCover } from "@/lib/open-library";
import type { Book, BookRecommendation } from "@/lib/types";
import { shuffleArray } from "@/lib/utils/array";

const MAX_BOOKS_FOR_PROMPT = 50;

export function buildGiftSystemMessage(): string {
  return `You are a book-recommendation assistant. Respond only with JSON, no markdown or code fences.

Requirements:
- Follow the provided JSON schema exactly; do not add extra fields.
- Return exactly five recommendations.
- Do not recommend any book that appears in the favorite 5-star list.
- Do not repeat titles or authors across the five results.
- If year or pageCount is unknown, use null (do not guess).
- Never use invented facts; prefer null rather than speculation.`;
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
  return `The reader rated these books 5 stars (favorites):

${booksContext}

Recommend five books to the user that they haven't read yet and are likely to enjoy based on their favorite reads. Respond using this JSON shape:
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
}`;
}

export function filterFiveStarBooks(books: Book[]): Book[] {
  const fiveStars = books.filter((book) => book.myRating === 5);
  const shuffled = shuffleArray(fiveStars);
  return shuffled.slice(0, MAX_BOOKS_FOR_PROMPT);
}

export async function generateGiftRecommendation(books: Book[], openaiClient: OpenAI): Promise<BookRecommendation[]> {
  const booksContext = formatBooksForPrompt(books);
  const prompt = buildGiftPrompt(booksContext);
  const systemMessage = buildGiftSystemMessage();

  const response = await openaiClient.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "book_recommendations",
        schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  author: { type: "string" },
                  year: { type: "number" },
                  genre: { type: "string" },
                  pageCount: { type: "number" },
                  reason: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    reasoning_effort: "low",
    max_completion_tokens: 4000,
  });

  const choice = response.choices[0];
  const finishReason = choice?.finish_reason;
  const content = choice?.message?.content;

  if (!content) {
    console.error("Failed to generate recommendations", {
      finishReason,
      message: choice?.message,
      usage: response.usage,
    });
    if (finishReason === "length") {
      throw new Error("Response was truncated. The model ran out of tokens. Try reducing the number of books sent.");
    }
    throw new Error("Failed to generate recommendations: no content in response");
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
