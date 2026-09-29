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

Recommend five books to the user that they haven't read yet and are likely to enjoy based on their favorite reads.`;
}

export function filterFiveStarBooks(books: Book[]): Book[] {
  const fiveStars = books.filter((book) => book.myRating === 5);
  const shuffled = shuffleArray(fiveStars);
  return shuffled.slice(0, MAX_BOOKS_FOR_PROMPT);
}

const GIFT_MODEL = "gpt-5.4-mini";
const GIFT_REASONING_EFFORT = "minimal";
const MAX_OUTPUT_TOKENS = 4000;

/** Strict structured-output schema. Every property must appear in `required`;
 *  "unknown" is expressed as a nullable type, not by omitting the field. */
const RECOMMENDATION_SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          author: { type: "string" },
          year: { type: ["number", "null"] },
          genre: { type: "string" },
          pageCount: { type: ["number", "null"] },
          reason: { type: "string" },
        },
        required: ["title", "author", "year", "genre", "pageCount", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["recommendations"],
  additionalProperties: false,
} as const;

export type GiftRecommendation = Omit<BookRecommendation, "imageUrl">;

export async function generateGiftRecommendation(books: Book[], openaiClient: OpenAI): Promise<GiftRecommendation[]> {
  const response = await openaiClient.responses.create({
    model: GIFT_MODEL,
    instructions: buildGiftSystemMessage(),
    input: buildGiftPrompt(formatBooksForPrompt(books)),
    text: {
      format: {
        type: "json_schema",
        name: "book_recommendations",
        schema: RECOMMENDATION_SCHEMA as unknown as Record<string, unknown>,
        strict: true,
      },
    },
    reasoning: { effort: GIFT_REASONING_EFFORT },
    max_output_tokens: MAX_OUTPUT_TOKENS,
    // Chat Completions never retained prompts; the Responses API defaults to store: true.
    store: false,
  });

  const content = response.output_text;

  if (!content) {
    console.error("Failed to generate recommendations", {
      status: response.status,
      incompleteDetails: response.incomplete_details,
      usage: response.usage,
    });
    if (response.incomplete_details?.reason === "max_output_tokens") {
      throw new Error("Response was truncated. The model ran out of tokens. Try reducing the number of books sent.");
    }
    throw new Error("Failed to generate recommendations: no content in response");
  }

  const parsed = JSON.parse(content) as { recommendations: GiftRecommendation[] };

  if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
    throw new Error("Invalid response format");
  }

  return parsed.recommendations;
}

/** Fetch cover art for each recommendation. `fetchBookCover` resolves to null on
 *  failure, so a missing cover never fails the batch. */
export async function enrichWithCovers(recommendations: GiftRecommendation[]): Promise<BookRecommendation[]> {
  return Promise.all(
    recommendations.map(async (rec) => ({
      ...rec,
      imageUrl: await fetchBookCover(rec.title, rec.author),
    })),
  );
}
