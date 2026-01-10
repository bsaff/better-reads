# Better Reads 📚

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
- Stats overview: total books, pages read, average rating, reviews
- Book cards with covers, ratings, dates, and reviews
- Local caching for instant reload

## Finding Your Profile URL

Your Goodreads profile URL looks like:
```
https://www.goodreads.com/user/show/23506884-username
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