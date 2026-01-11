# Better Reads 📚

![Better Reads Screenshot](public/screenshot.png)

A simple app to view your Goodreads reading history.

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste your Goodreads profile URL.

## Features

- Load any Goodreads profile via URL
- Get personalized recommendations based on your favorite books
- Stats overview: total books, pages read, average rating, reviews
- Book cards with covers, ratings, dates, and reviews
- Local caching for instant reload

## Finding Your Profile URL

Here's my Goodreads profile url; you can use it to test:
```
"https://www.goodreads.com/user/show/23506884-ben"
```

1. Go to [goodreads.com](https://www.goodreads.com)
2. Click your profile avatar
3. Click "Profile"
4. Copy the URL from your browser

## Development

```bash
# Run tests
npm test

# Run tests once
npm run test:run

# Build for production
npm run build
```

## How It Works

Goodreads provides public RSS feeds for user bookshelves. This app:

1. Parses the user ID from the profile URL
2. Fetches the RSS feed for the user's "read" shelf
3. Caches the data locally in `cache/{userId}.json`
4. Renders the books in a beautiful grid layout

No API key or authentication required for public profiles!

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Vitest for testing


## Future features

- User profile support
- Saved gift ideas
- Saved "friend/family" members for users
- Verify accuracy of book recommendations
- Frame it as a gifting app for readers? or a more good reads replacement
- Suggest me something else (with optional additional context like past suggestions and user preference, e.g. "more horror")

## Future dev

- Feed all read books in as context to improve recommendations and eliminate chance of "already read" reccommendations

- Paginate / infinite scroll the reading history page.

- Relationalize, store in supabase:
    - `profiles`
        - `id` (uuid, PK)
        - `goodreads_user_id` (text, unique)
        - `user_name` (text, nullable)
        - `scraped_at` (timestamptz)
    - `books`
        - `goodreads_id` (text, PK)
        - `title` (text)
        - `author` (text)
        - `isbn` (text, nullable)
        - `pages` (int, nullable)
        - `avg_rating` (numeric, nullable)
        - `year_published` (text, nullable)
        - `image_url` (text, nullable)
        - `description` (text, nullable)
    - `user_books`
        - `id` (uuid, PK)
        - `profile_id` (uuid, FK → profiles)
        - `book_id` (text, FK → books.goodreads_id)
        - `my_rating` (smallint, **indexed**)
        - `my_rating_text` (text, nullable)
        - `date_read` (date, nullable)
        - `date_added` (date, nullable)
        - `review` (text, nullable)