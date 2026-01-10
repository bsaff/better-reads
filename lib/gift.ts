import type OpenAI from "openai";
import type { Book } from "@/lib/types";

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

Based on their taste, recommend ONE specific book that would make a great gift. The book should:
1. NOT be one they've already read (listed above)
2. Match their apparent preferences in genre, style, and themes
3. Be a well-regarded book that makes a thoughtful gift

Provide your recommendation in this format:
- Book title and author
- A brief explanation (2-3 sentences) of why this would be perfect for them based on their favorites
- What makes this book gift-worthy

Keep your response concise and warm, as if you're helping a friend pick out a gift.`;
}

export function filterFiveStarBooks(books: Book[]): Book[] {
  return books.filter((book) => book.myRating === 5);
}

export async function generateGiftRecommendation(books: Book[], openaiClient: OpenAI): Promise<string> {
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
    max_tokens: 500,
    temperature: 0.7,
  });

  const recommendation = response.choices[0]?.message?.content;

  if (!recommendation) {
    throw new Error("Failed to generate a recommendation");
  }

  return recommendation;
}
