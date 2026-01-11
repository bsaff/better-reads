"use client";

import { useEffect } from "react";
import { saveRecentProfile } from "@/lib/recent-profile";

interface SaveRecentProfileProps {
  userId: string;
  username?: string | null;
}

export function SaveRecentProfile({ userId, username }: SaveRecentProfileProps) {
  useEffect(() => {
    // Reconstruct the URL from userId and optional username
    const url = username
      ? `https://www.goodreads.com/user/show/${userId}-${username}`
      : `https://www.goodreads.com/user/show/${userId}`;

    saveRecentProfile(url, username ?? undefined);
  }, [userId, username]);

  return null;
}
