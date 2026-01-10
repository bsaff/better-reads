export interface Book {
  title: string;
  author: string;
  bookId: string;
  isbn: string | null;
  pages: number | null;
  avgRating: number | null;
  myRating: number;
  myRatingText: string | null;
  dateRead: string | null;
  dateAdded: string | null;
  dateCreated: string | null;
  yearPublished: string | null;
  imageUrl: string | null;
  review: string | null;
  description: string | null;
}

export interface ProfileData {
  userId: string;
  userName: string | null;
  shelf: string;
  totalBooks: number;
  scrapedAt: string;
  books: Book[];
}

export interface BookRecommendation {
  title: string;
  author: string;
  year: number | null;
  genre: string;
  pageCount: number | null;
  reason: string;
  imageUrl: string | null;
}
