import { CommandsRegistry, handlerLogin, handlerRegister, handlerReset, registerCommand, runCommand } from "./commands";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
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