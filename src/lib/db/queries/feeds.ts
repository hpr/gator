import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { Feed, feeds } from "../schema";

export const createFeed = async (name: string, url: string, userId: string) => {
  const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
  return result;
};

export const getFeeds = async () => {
  return await db.select().from(feeds);
};

export const getFeedByUrl = async (url: string) => {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
};

export const markFeedFetched = async (id: string) => {
  const now = new Date();
  await db.update(feeds).set({
    lastFetchedAt: now,
    updatedAt: now,
  }).where(eq(feeds.id, id));
};

export const getNextFeedToFetch = async (): Promise<Feed> => {
  const [result]: Feed[] = await db.execute(sql`select * from ${feeds} order by ${feeds.lastFetchedAt} nulls first limit 1`);
  return result;
};
