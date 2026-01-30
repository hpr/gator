import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export const getUser = async (name: string) => {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export const resetUsers = async () => {
  await db.delete(users);
}

export const getUsers = async () => {
  return await db.select().from(users);
}