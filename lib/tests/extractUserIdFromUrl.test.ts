import { describe, expect, it } from "vitest";
import { extractUserIdFromUrl } from "../scraper";

describe("extractUserIdFromUrl", () => {
  it("extracts ID from user profile URL", () => {
    expect(extractUserIdFromUrl("https://www.goodreads.com/user/show/23506884-ben")).toBe("23506884");
  });

  it("extracts ID from user profile URL without name suffix", () => {
    expect(extractUserIdFromUrl("https://www.goodreads.com/user/show/23506884")).toBe("23506884");
  });

  it("extracts ID from author profile URL", () => {
    expect(extractUserIdFromUrl("https://www.goodreads.com/author/show/18329379.Benjamin_Niespodziany")).toBe(
      "18329379",
    );
  });

  it("extracts ID from author profile URL without name suffix", () => {
    expect(extractUserIdFromUrl("https://www.goodreads.com/author/show/18329379")).toBe("18329379");
  });

  it("extracts ID from URL without protocol", () => {
    expect(extractUserIdFromUrl("goodreads.com/user/show/23506884-ben")).toBe("23506884");
  });

  it("returns raw number if just a numeric ID is provided", () => {
    expect(extractUserIdFromUrl("23506884")).toBe("23506884");
  });

  it("returns raw number with whitespace trimmed", () => {
    expect(extractUserIdFromUrl("  23506884  ")).toBe("23506884");
  });

  it("returns null for invalid URL", () => {
    expect(extractUserIdFromUrl("https://www.goodreads.com/book/show/12345")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(extractUserIdFromUrl("not-a-valid-id")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractUserIdFromUrl("")).toBeNull();
  });
});
