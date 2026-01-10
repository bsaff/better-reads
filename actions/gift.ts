"use server";

import OpenAI from "openai";
import { getCachedProfile } from "@/lib/cache";
import { filterFiveStarBooks, generateGiftRecommendation } from "@/lib/gift";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GiftSuggestionResult {
  success: boolean;
  recommendation?: string;
  error?: string;
  fiveStarCount?: number;
}

export async function suggestGift(userId: string): Promise<GiftSuggestionResult> {
  const profile = await getCachedProfile(userId);

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  const fiveStarBooks = filterFiveStarBooks(profile.books);

  if (fiveStarBooks.length === 0) {
    return {
      success: false,
      error: "This reader hasn't rated any books 5 stars yet. We need their favorites to suggest a gift!",
    };
  }

  try {
    const recommendation = await generateGiftRecommendation(fiveStarBooks, openai);
    return {
      success: true,
      recommendation,
      fiveStarCount: fiveStarBooks.length,
    };
  } catch (err) {
    console.error("Gift recommendation error:", err);
    return {
      success: false,
      error: "Failed to generate recommendation. Please try again.",
    };
  }
}
