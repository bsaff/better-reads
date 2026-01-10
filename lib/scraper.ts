import type { Book, ProfileData } from "./types";

const RATING_TEXT: Record<number, string | null> = {
  0: null,
  1: "did not like it",
  2: "it was ok",
  3: "liked it",
  4: "really liked it",
  5: "it was amazing",
};

function extractValue(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return null;
  return match[1]
    .trim()
    .replace(/<!\\[CDATA\\[|\\]\\]>/g, "")
    .trim();
}

function extractNumPages(xml: string): number | null {
  const bookMatch = xml.match(/<book id="[^"]*">\s*<num_pages>(\d+)<\/num_pages>\s*<\/book>/);
  return bookMatch ? parseInt(bookMatch[1], 10) : null;
}

/**
 * Parse a single book from the RSS feed
 * @param itemXml - The XML string for a single book
 * @returns The parsed book
 */
function parseItem(itemXml: string): Book {
  const title = extractValue(itemXml, "title");
  const bookId = extractValue(itemXml, "book_id");
  const authorName = extractValue(itemXml, "author_name");
  const isbn = extractValue(itemXml, "isbn");
  const userRating = parseInt(extractValue(itemXml, "user_rating") || "0", 10) || 0;
  const userReadAt = extractValue(itemXml, "user_read_at");
  const userDateAdded = extractValue(itemXml, "user_date_added");
  const userDateCreated = extractValue(itemXml, "user_date_created");
  const averageRating = parseFloat(extractValue(itemXml, "average_rating") || "") || null;
  const bookPublished = extractValue(itemXml, "book_published");
  const numPages = extractNumPages(itemXml);
  const userReview = extractValue(itemXml, "user_review");
  const bookImageUrl = extractValue(itemXml, "book_large_image_url");
  const bookDescription = extractValue(itemXml, "book_description");

  return {
    title:
      title
        ?.replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"') || "",
    author: authorName || "",
    bookId: bookId || "",
    isbn,
    pages: numPages,
    avgRating: averageRating,
    myRating: userRating,
    myRatingText: RATING_TEXT[userRating] ?? null,
    dateRead: userReadAt,
    dateAdded: userDateAdded,
    dateCreated: userDateCreated,
    yearPublished: bookPublished,
    imageUrl: bookImageUrl,
    review: userReview || null,
    description: bookDescription?.substring(0, 500) || null,
  };
}

export function parseRSS(xml: string): Book[] {
  const items = xml.split("<item>").slice(1);
  return items.map((item) => {
    const itemXml = `<item>${item.split("</item>")[0]}</item>`;
    return parseItem(itemXml);
  });
}

export async function scrapeGoodreadsProfile(userId: string, shelf = "read"): Promise<ProfileData> {
  const books: Book[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}&page=${page}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page ${page}: ${response.statusText}`);
    }

    const xml = await response.text();
    const pageBooks = parseRSS(xml);

    if (pageBooks.length === 0) {
      hasMore = false;
    } else {
      books.push(...pageBooks);
      page++;

      // Goodreads RSS returns 100 per page max
      if (pageBooks.length < 100) {
        hasMore = false;
      }
    }
  }

  return {
    userId,
    shelf,
    totalBooks: books.length,
    scrapedAt: new Date().toISOString(),
    books,
  };
}

/**
 * Extract user ID from a Goodreads profile URL
 * Supports formats like:
 * - https://www.goodreads.com/user/show/23506884-ben
 * - https://www.goodreads.com/user/show/23506884
 * - https://www.goodreads.com/author/show/18329379.Benjamin_Niespodziany
 * - https://www.goodreads.com/author/show/18329379
 * - goodreads.com/user/show/23506884-ben
 */
export function extractUserIdFromUrl(url: string): string | null {
  // Try to match the user ID from /user/show/ or /author/show/ URLs
  const match = url.match(/\/(user|author)\/show\/(\d+)/);
  if (match) {
    return match[2];
  }

  // If it's just a number, return it directly
  if (/^\d+$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}
