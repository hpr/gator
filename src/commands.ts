import { setUser } from "./config";
import { createUser, getUser } from "./lib/db/queries/users";

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