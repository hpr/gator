import { getConfig, setUser } from "./config";

function main() {
  setUser("boots");
  console.log(getConfig());
}

main();