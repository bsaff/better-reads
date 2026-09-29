import { describe, expect, it } from "vitest";
import { buildGiftPrompt, filterFiveStarBooks, formatBooksForPrompt } from "../gift";
import type { Book } from "../types";

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    title: "Dune",
    author: "Frank Herbert",
    bookId: "1",
    isbn: null,
    pages: null,
    avgRating: null,
    myRating: 5,
    myRatingText: null,
    dateRead: null,
    dateAdded: null,
    dateCreated: null,
    yearPublished: null,
    imageUrl: null,
    review: null,
    description: null,
    ...overrides,
  };
}

describe("filterFiveStarBooks", () => {
  it("keeps only books rated 5 stars", () => {
    const books = [
      makeBook({ title: "Five", myRating: 5 }),
      makeBook({ title: "Four", myRating: 4 }),
      makeBook({ title: "Unrated", myRating: 0 }),
    ];
    const result = filterFiveStarBooks(books);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Five");
  });

  it("caps the result at 50 books", () => {
    const books = Array.from({ length: 80 }, (_, i) => makeBook({ title: `Book ${i}`, bookId: String(i) }));
    expect(filterFiveStarBooks(books)).toHaveLength(50);
  });

  it("returns an empty array when nothing is rated 5 stars", () => {
    expect(filterFiveStarBooks([makeBook({ myRating: 3 })])).toEqual([]);
  });
});

describe("formatBooksForPrompt", () => {
  it("includes title and author", () => {
    expect(formatBooksForPrompt([makeBook()])).toContain('- "Dune" by Frank Herbert');
  });

  it("includes description and year when present", () => {
    const formatted = formatBooksForPrompt([makeBook({ description: "Desert epic", yearPublished: "1965" })]);
    expect(formatted).toContain("Description: Desert epic");
    expect(formatted).toContain("(1965)");
  });

  it("omits optional fields that are missing", () => {
    const formatted = formatBooksForPrompt([makeBook()]);
    expect(formatted).not.toContain("Description:");
    expect(formatted).not.toContain("(");
  });

  it("separates multiple books", () => {
    const formatted = formatBooksForPrompt([makeBook(), makeBook({ title: "Neuromancer", author: "Gibson" })]);
    expect(formatted).toContain("Dune");
    expect(formatted).toContain("Neuromancer");
  });
});

describe("buildGiftPrompt", () => {
  it("embeds the formatted book context", () => {
    expect(buildGiftPrompt('- "Dune" by Frank Herbert')).toContain('- "Dune" by Frank Herbert');
  });

  it("asks for five recommendations", () => {
    expect(buildGiftPrompt("")).toContain("Recommend five books");
  });
});
