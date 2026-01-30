import { readConfig, setUser } from "./config";
import { createFeed } from "./lib/db/queries/feeds";
import { createUser, getUser, getUsers, resetUsers } from "./lib/db/queries/users";
import { fetchFeed, printFeed } from "./feeds";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = {
  [cmdName: string]: CommandHandler;
};

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
export const handleAgg: CommandHandler = async (cmdName: string) => {
  console.log(JSON.stringify(await fetchFeed("https://www.wagslane.dev/index.xml")));
};
export const handleAddFeed: CommandHandler = async (cmdName: string, name: string, url: string) => {
  const config = readConfig();
  if (!config.currentUserName) throw Error("no currentUserName");
  const user = await getUser(config.currentUserName);
  const feed = await createFeed(name, url, user.id);
  printFeed(feed, user);
};
