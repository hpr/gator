import { readConfig, setUser } from "./config";
import { createFeed, getFeedByUrl, getFeeds } from "./lib/db/queries/feeds";
import { createUser, getUser, getUserById, getUsers, resetUsers } from "./lib/db/queries/users";
import { fetchFeed, printFeed, scrapeFeeds } from "./feeds";
import { createFeedFollow, deleteFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedFollows";
import { User } from "./lib/db/schema";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = {
  [cmdName: string]: CommandHandler;
};

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;
export const middlewareLoggedIn = (handler: UserCommandHandler): CommandHandler => {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    if (!config.currentUserName) throw Error("no currentUserName");
    const user = await getUser(config.currentUserName);
    return await handler(cmdName, user, ...args);
  }
}

export const registerCommand = (registry: CommandsRegistry, cmdName: string, handler: CommandHandler) => {
  registry[cmdName] = handler;
};
export const runCommand = async (registry: CommandsRegistry, cmdName: string, ...args: string[]) => {
  if (!registry[cmdName]) throw Error("no command");
  await registry[cmdName](cmdName, ...args);
};

export const handlerLogin: CommandHandler = async (cmdName: string, user: string) => {
  if (!user) throw Error("no username");
  if (!await getUser(user)) throw Error("user does not exist");
  setUser(user);
  console.log(`${user} has been set`);
};
export const handlerRegister: CommandHandler = async (cmdName: string, user: string) => {
  if (!user) throw Error("no username");
  if (await getUser(user)) throw Error("user already exists");
  const dbUser = await createUser(user);
  await handlerLogin("login", user);
  console.log(`${user} has been created/registered`, dbUser);
};
export const handlerReset: CommandHandler = async (cmdName: string) => {
  await resetUsers();
  console.log("reset users successful");
};
export const handlerUsers: CommandHandler = async (cmdName: string) => {
  const users = await getUsers();
  const config = readConfig();
  console.log(users.map(u => `* ${u.name}${u.name === config.currentUserName ? ' (current)' : ''}`).join("\n"));
};
const parseDuration = (durationStr: string) => durationStr.match(/^(\d+)(ms|s|m|h)$/) ?? [];
export const handlerAgg: CommandHandler = async (cmdName: string, timeBetweenReqs: string = "5s") => {
  const [_, num = 5, unit = 's'] = parseDuration(timeBetweenReqs);
  const msBetweenRecs = +num * ({
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
  }[unit] ?? 0);
  console.log(`Collecting feeds every ${timeBetweenReqs}`);
  await scrapeFeeds();
  const interval = setInterval(async () => {
    await scrapeFeeds();
  }, msBetweenRecs);
  await new Promise<void>((resolve) => {
  process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
};
export const handlerAddFeed: UserCommandHandler = async (cmdName: string, user: User, name: string, url: string) => {
  const feed = await createFeed(name, url, user.id);
  await createFeedFollow(feed.id, user.id);
  printFeed(feed, user);
};
export const handlerFeeds: CommandHandler = async (cmdName: string) => {
  for (const feed of await getFeeds()) {
    const user = await getUserById(feed.userId);
    console.log(`${feed.name} (${feed.url}) by ${user.name}`);
  }
};
export const handlerFollow: UserCommandHandler = async (cmdName: string, user: User, url: string) => {
  const feed = await getFeedByUrl(url);
  const feedFollow = await createFeedFollow(feed.id, user.id);
  console.log(`${feedFollow.userName} is now following ${feed.name}`);
};
export const handlerFollowing: UserCommandHandler = async (cmdName: string, user: User) => {
  const feedFollows = await getFeedFollowsForUser(user.name);
  console.log("Following:");
  console.log(feedFollows.map(ff => `* ${ff.feedName}`).join("\n"));
};
export const handlerUnfollow: UserCommandHandler = async (cmdName: string, user: User, url: string) => {
  await deleteFeedFollow(user.name, url);
};