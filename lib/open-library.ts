interface OpenLibrarySearchResult {
  docs: Array<{
    isbn?: string[];
    cover_i?: number;
  }>;
}

/**
 * Fetch a book cover URL from Open Library API
 * @param title - The book title
 * @param author - The book author
 * @returns The cover image URL or null if not found
 */
export async function fetchBookCover(title: string, author: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      title: title,
      author: author,
      limit: "1",
      fields: "isbn,cover_i",
    });

    const response = await fetch(`https://openlibrary.org/search.json?${params}`);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OpenLibrarySearchResult;
    const firstResult = data.docs[0];

    if (!firstResult) {
      return null;
    }

    // Prefer cover_i (Open Library cover ID) as it's more reliable
    if (firstResult.cover_i) {
      return `https://covers.openlibrary.org/b/id/${firstResult.cover_i}-M.jpg`;
    }

    // Fallback to ISBN if available
    const isbn = firstResult.isbn?.[0];
    if (isbn) {
      return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
    }

    return null;
  } catch {
    return null;
  }
}
