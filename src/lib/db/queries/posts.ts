import { eq, desc } from "drizzle-orm";
import { db } from "..";
import { feeds, Post, posts, users } from "../schema";

export const createPost = async (feedId: string, title: string, url: string, description?: string, publishedAt?: Date): Promise<Post | undefined> => {
  const [result] = await db.insert(posts).values({ feedId, title, url, description, publishedAt }).onConflictDoNothing().returning();
  return result;
};

export const getPostsForUser = async (userName: string, limit: number = Infinity) => {
  const [user] = await db.select().from(users).where(eq(users.name, userName));
  const userPosts = await db.select().from(feeds).where(eq(feeds.userId, user.id))
    .innerJoin(posts, eq(feeds.id, posts.feedId))
    .orderBy(desc(posts.publishedAt)).limit(limit);
  return userPosts;
};
