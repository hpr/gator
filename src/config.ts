import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : "";
type KeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K]
};

const getConfigFilePath = () => path.join(os.homedir(), ".gatorconfig.json");
const writeConfig = (cfg: Config) => {
  const rawConfig: KeysToSnakeCase<Config> = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };
  fs.writeFileSync(getConfigFilePath(), JSON.stringify(rawConfig));
};
const validateConfig = (rawConfig: unknown): Config => {
  if (!rawConfig || typeof rawConfig !== "object") throw Error("bad config");
  if (!("db_url" in rawConfig) || typeof rawConfig.db_url !== "string") throw Error("bad db_url");
  if ("current_user_name" in rawConfig && typeof rawConfig.current_user_name !== "string") throw Error("bad current_user_name");

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: "current_user_name" in rawConfig ? String(rawConfig.current_user_name) : undefined,
  };
};
export const readConfig = (): Config => validateConfig(JSON.parse(fs.readFileSync(getConfigFilePath(), "utf-8")));

export const setUser = (user: string) => {
  const config = readConfig();
  config.currentUserName = user;
  writeConfig(config);
};
