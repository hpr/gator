import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";
import { PgUUID } from "drizzle-orm/pg-core";

export const createFeed = async (name: string, url: string, userId: string) => {
  const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
  return result;
}
