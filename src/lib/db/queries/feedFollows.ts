import { eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";

export const createFeedFollow = async (feedId: string, userId: string) => {
  const [feedFollow] = await db.insert(feedFollows).values({ feedId, userId }).returning();
  const [result] = await db.select({
    id: feedFollows.id,
    createdAt: feedFollows.createdAt,
    updatedAt: feedFollows.updatedAt,
    feedName: feeds.name,
    userName: users.name,
  }).from(feedFollows).where(eq(feedFollows.id, feedFollow.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id));
  return result;
};

export const getFeedFollowsForUser = async (userName: string) => {
  const [user] = await db.select().from(users).where(eq(users.name, userName));
  const result = await db.select({
    userName: users.name,
    feedName: feeds.name,
  }).from(feedFollows).where(eq(feedFollows.userId, user.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id));
  return result;
}