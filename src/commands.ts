import { setUser } from "./config";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandsRegistry = {
  [cmdName: string]: CommandHandler;
};

export const registerCommand = (registry: CommandsRegistry, cmdName: string, handler: CommandHandler) => {
  registry[cmdName] = handler;
};
export const runCommand = (registry: CommandsRegistry, cmdName: string, ...args: string[]) => {
  if (!registry[cmdName]) throw Error("no command");
  registry[cmdName](cmdName, ...args);
};

export const handlerLogin: CommandHandler = (cmdName: string, user: string) => {
  if (!user) throw Error("no username");
  setUser(user);
  console.log(`${user} has been set`);
};