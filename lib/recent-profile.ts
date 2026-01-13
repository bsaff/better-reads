export interface RecentProfile {
  url: string;
  username?: string;
}

const STORAGE_KEY = "better-reads:recent-profile";

export function saveRecentProfile(url: string, username?: string): void {
  if (typeof window === "undefined") return;

  try {
    const data: RecentProfile = { url, username };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save recent profile:", error);
  }
}

export function getRecentProfile(): RecentProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as RecentProfile;
  } catch (error) {
    console.error("Failed to get recent profile:", error);
    return null;
  }
}
