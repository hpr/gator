import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";

export const createFeed = async (name: string, url: string, userId: string) => {
  const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
  return result;
}

export const getFeeds = async () => {
  return await db.select().from(feeds);
}

export const getFeedByUrl = async (url: string) => {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}