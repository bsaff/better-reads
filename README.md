# Better Reads 📚

A simple tool to scrape your Goodreads reading data into a local JSON file.

## Usage

```bash
# Scrape your books (default: user 23506884, shelf "read")
npm run scrape

# Scrape a specific user and shelf
node scrape.js <user_id> <shelf>

# Examples
node scrape.js 23506884 read
node scrape.js 23506884 to-read
node scrape.js 23506884 favorites
```

## Finding Your User ID

Your Goodreads user ID is in your profile URL:
```
https://www.goodreads.com/user/show/23506884-ben
                                    ^^^^^^^^
                                    This is your user ID
```

## Output

The scraper creates `goodreads_books.json` with the following structure:

```json
{
  "userId": "23506884",
  "shelf": "read",
  "totalBooks": 359,
  "scrapedAt": "2026-01-10T20:01:00.000Z",
  "books": [
    {
      "title": "Book Title",
      "author": "Author Name",
      "bookId": "12345",
      "isbn": "0123456789",
      "pages": 300,
      "avgRating": 4.2,
      "myRating": 5,
      "myRatingText": "it was amazing",
      "dateRead": "Wed, 10 Dec 2025 00:00:00 +0000",
      "dateAdded": "Wed, 10 Dec 2025 19:04:54 -0800",
      "yearPublished": "2020",
      "imageUrl": "https://...",
      "review": "Your review text...",
      "description": "Book description..."
    }
  ]
}
```

## Rating Scale

- `5` - it was amazing
- `4` - really liked it
- `3` - liked it
- `2` - it was ok
- `1` - did not like it
- `0` - not rated

## How It Works

Goodreads provides public RSS feeds for user bookshelves. This tool:

1. Fetches the RSS feed for the specified user/shelf
2. Parses the XML to extract book data
3. Paginates through all results (100 books per page)
4. Saves everything to a JSON file

No API key or authentication required for public profiles!
