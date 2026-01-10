import fs from "node:fs/promises";
import path from "node:path";
import type { ProfileData } from "./types";

const CACHE_DIR = path.join(process.cwd(), "cache");

async function ensureCacheDir(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

function getCachePath(userId: string): string {
  return path.join(CACHE_DIR, `${userId}.json`);
}

export async function getCachedProfile(userId: string): Promise<ProfileData | null> {
  try {
    const filePath = getCachePath(userId);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as ProfileData;
  } catch {
    return null;
  }
}

export async function cacheProfile(userId: string, data: ProfileData): Promise<void> {
  await ensureCacheDir();
  const filePath = getCachePath(userId);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function isCached(userId: string): Promise<boolean> {
  try {
    await fs.access(getCachePath(userId));
    return true;
  } catch {
    return false;
  }
}
