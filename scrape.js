#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const USER_ID = process.argv[2] || '23506884';
const SHELF = process.argv[3] || 'read';

console.log(`\n📚 Better Reads - Goodreads Scraper`);
console.log(`===================================\n`);
console.log(`User ID: ${USER_ID}`);
console.log(`Shelf: ${SHELF}\n`);

// Fetch a URL and return the body as a string
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Simple XML parser for Goodreads RSS
function extractValue(xml, tag) {
  const regex = new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return null;
  return match[1].trim().replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim();
}

function extractNumPages(xml) {
  const bookMatch = xml.match(/<book id="[^"]*">\s*<num_pages>(\d+)<\/num_pages>\s*<\/book>/);
  return bookMatch ? parseInt(bookMatch[1]) : null;
}

function parseItem(itemXml) {
  const title = extractValue(itemXml, 'title');
  const bookId = extractValue(itemXml, 'book_id');
  const authorName = extractValue(itemXml, 'author_name');
  const isbn = extractValue(itemXml, 'isbn');
  const userRating = parseInt(extractValue(itemXml, 'user_rating')) || 0;
  const userReadAt = extractValue(itemXml, 'user_read_at');
  const userDateAdded = extractValue(itemXml, 'user_date_added');
  const userDateCreated = extractValue(itemXml, 'user_date_created');
  const averageRating = parseFloat(extractValue(itemXml, 'average_rating')) || null;
  const bookPublished = extractValue(itemXml, 'book_published');
  const numPages = extractNumPages(itemXml);
  const userReview = extractValue(itemXml, 'user_review');
  const bookImageUrl = extractValue(itemXml, 'book_large_image_url');
  const bookDescription = extractValue(itemXml, 'book_description');

  const ratingText = {
    0: null,
    1: 'did not like it',
    2: 'it was ok',
    3: 'liked it',
    4: 'really liked it',
    5: 'it was amazing'
  };

  return {
    title: title?.replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
    author: authorName,
    bookId,
    isbn,
    pages: numPages,
    avgRating: averageRating,
    myRating: userRating,
    myRatingText: ratingText[userRating],
    dateRead: userReadAt,
    dateAdded: userDateAdded,
    dateCreated: userDateCreated,
    yearPublished: bookPublished,
    imageUrl: bookImageUrl,
    review: userReview || null,
    description: bookDescription?.substring(0, 500) || null
  };
}

function parseRSS(xml) {
  const items = xml.split('<item>').slice(1);
  return items.map(item => {
    const itemXml = '<item>' + item.split('</item>')[0] + '</item>';
    return parseItem(itemXml);
  });
}

async function scrapeBooks() {
  const books = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://www.goodreads.com/review/list_rss/${USER_ID}?shelf=${SHELF}&page=${page}`;
    process.stdout.write(`Fetching page ${page}...`);
    
    try {
      const xml = await fetch(url);
      const pageBooks = parseRSS(xml);
      
      if (pageBooks.length === 0) {
        hasMore = false;
        console.log(' no more books');
      } else {
        books.push(...pageBooks);
        console.log(` found ${pageBooks.length} books`);
        page++;
        
        // Goodreads RSS returns 100 per page max
        if (pageBooks.length < 100) {
          hasMore = false;
        }
      }
    } catch (err) {
      console.error(` error: ${err.message}`);
      hasMore = false;
    }
  }

  return books;
}

async function main() {
  const books = await scrapeBooks();
  
  if (books.length === 0) {
    console.log('\n❌ No books found. Check the user ID and shelf name.');
    process.exit(1);
  }

  const output = {
    userId: USER_ID,
    shelf: SHELF,
    totalBooks: books.length,
    scrapedAt: new Date().toISOString(),
    books
  };

  const outputPath = path.join(__dirname, 'goodreads_books.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Success! Scraped ${books.length} books`);
  console.log(`📄 Saved to: ${outputPath}\n`);

  // Show some stats
  const rated = books.filter(b => b.myRating > 0);
  const avgRating = rated.length > 0 
    ? (rated.reduce((sum, b) => sum + b.myRating, 0) / rated.length).toFixed(2)
    : 0;
  const totalPages = books.reduce((sum, b) => sum + (b.pages || 0), 0);
  const withReviews = books.filter(b => b.review).length;

  console.log(`📊 Stats:`);
  console.log(`   Books: ${books.length}`);
  console.log(`   Rated: ${rated.length} (avg: ${avgRating}/5)`);
  console.log(`   Pages: ${totalPages.toLocaleString()}`);
  console.log(`   Reviews: ${withReviews}\n`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
