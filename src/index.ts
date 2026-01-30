import { CommandsRegistry, handlerLogin, registerCommand, runCommand } from "./commands";

function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("no arguments");
    process.exit(1);
  }
  const [cmdName, ...cmdArgs] = args;
  try {
    runCommand(registry, cmdName, ...cmdArgs);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();