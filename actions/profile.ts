"use server";

import { redirect } from "next/navigation";
import { cacheProfile, getCachedProfile } from "@/lib/cache";
import { extractUserIdFromUrl, scrapeGoodreadsProfile } from "@/lib/scraper";

export interface ActionResult {
  error?: string;
}

export async function get(formData: FormData): Promise<ActionResult> {
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "Please enter a Goodreads profile URL" };
  }

  const userId = extractUserIdFromUrl(url);

  if (!userId) {
    return {
      error: "Invalid Goodreads URL. Please enter a URL like: https://www.goodreads.com/user/show/12345-username",
    };
  }

  // Check cache first
  const cached = await getCachedProfile(userId);
  if (cached) {
    redirect(`/profile/${userId}`);
  }

  // Scrape and cache
  try {
    const profileData = await scrapeGoodreadsProfile(userId);

    if (profileData.books.length === 0) {
      return {
        error: "No books found. Make sure the profile is public and has books on the 'read' shelf.",
      };
    }

    await cacheProfile(userId, profileData);
  } catch (err) {
    console.error("Scraping error:", err);
    return {
      error: "Failed to load profile. Please check the URL and try again.",
    };
  }

  redirect(`/profile/${userId}`);
}
