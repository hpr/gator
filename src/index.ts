import { CommandsRegistry, handleAddFeed, handleAgg, handleFeeds, handlerLogin, handlerRegister, handlerReset, handlerUsers, registerCommand, runCommand } from "./commands";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handleAgg);
  registerCommand(registry, "addfeed", handleAddFeed);
  registerCommand(registry, "feeds", handleFeeds);
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("no arguments");
    process.exit(1);
  }
  const [cmdName, ...cmdArgs] = args;
  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  process.exit(0);
}

main();