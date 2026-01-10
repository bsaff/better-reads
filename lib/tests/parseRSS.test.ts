import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseRSS } from "../scraper";

const fixturesDir = path.join(__dirname, "fixtures");
const exampleRSS = fs.readFileSync(path.join(fixturesDir, "example-rss.xml"), "utf-8");

describe("parseRSS", () => {
  it("parses multiple books from RSS feed", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books.length).toBeGreaterThan(0);
  });

  it("extracts user name from channel title", () => {
    const { userName } = parseRSS(exampleRSS);
    expect(userName).toBe("Ben");
  });

  it("extracts book title", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].title).toBe("Meetings With Remarkable Men");
  });

  it("extracts author name", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].author).toBe("G.I. Gurdjieff");
  });

  it("extracts book ID", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].bookId).toBe("3064956");
  });

  it("extracts ISBN", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].isbn).toBe("0710070322");
  });

  it("extracts page count", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].pages).toBe(303);
  });

  it("extracts average rating", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].avgRating).toBe(4.17);
  });

  it("extracts user rating", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].myRating).toBe(3);
  });

  it("converts user rating to text", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].myRatingText).toBe("liked it");
    // Find a 5-star rating
    const fiveStarBook = books.find((b) => b.myRating === 5);
    expect(fiveStarBook?.myRatingText).toBe("it was amazing");
  });

  it("extracts date read", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].dateRead).toContain("Wed, 10 Dec 2025");
  });

  it("extracts year published", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].yearPublished).toBe("1960");
  });

  it("extracts image URL", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].imageUrl).toContain("goodreads.com");
    expect(books[0].imageUrl).toContain("3064956");
  });

  it("extracts description (truncated to 500 chars)", () => {
    const { books } = parseRSS(exampleRSS);
    expect(books[0].description).toBeTruthy();
    expect(books[0].description?.length).toBeLessThanOrEqual(500);
  });

  it("extracts user review when present", () => {
    const { books } = parseRSS(exampleRSS);
    // Third book (Autobiography) has a review
    const bookWithReview = books.find((b) => b.title === "Autobiography");
    expect(bookWithReview?.review).toContain("One of the best books");
  });

  it("returns null for review when not present", () => {
    const { books } = parseRSS(exampleRSS);
    // First book has no review
    expect(books[0].review).toBeNull();
  });

  it("handles empty RSS feed", () => {
    const emptyRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty shelf</title>
  </channel>
</rss>`;
    const { books } = parseRSS(emptyRSS);
    expect(books).toEqual([]);
  });

  it("returns null userName when title doesn't match pattern", () => {
    const emptyRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty shelf</title>
  </channel>
</rss>`;
    const { userName } = parseRSS(emptyRSS);
    expect(userName).toBeNull();
  });

  it("decodes HTML entities in title", () => {
    const rssWithEntities = `<item>
      <title><![CDATA[Book &amp; Title &apos;Test&apos;]]></title>
      <book_id>123</book_id>
      <author_name>Author</author_name>
      <user_rating>0</user_rating>
    </item>`;
    const { books } = parseRSS(rssWithEntities);
    expect(books[0].title).toBe("Book & Title 'Test'");
  });
});
