import {
  readFileSync,
  readdirSync,
  existsSync,
  lstatSync,
  realpathSync,
} from "node:fs";
import { resolve } from "node:path";

export function resolveOptions(args) {
  const options = {};
  const rest = [];

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      options[key] = value !== undefined ? value : true;
    } else if (arg.startsWith("-")) {
      arg
        .slice(1)
        .split("")
        .forEach((c) => (options[c] = true));
    } else {
      rest.push(arg);
    }
  }

  return { args: rest, options };
}

export function resolveFileOrDir(path, cb) {
  if (!existsSync(path)) {
    console.error(`'${path}' path does not exist`);
    process.exit(1);
  }

  path = realpathSync(path);
  const stats = lstatSync(path);

  if (stats.isDirectory()) {
    readdirSync(path).forEach((file) =>
      resolveFileOrDir(resolve(path, file), cb),
    );
  } else if (path.endsWith(".js") || path.endsWith(".ts")) {
    cb(readFileSync(path, "utf8"), path.replace(cwd, ""));
  }
}

export const cwd = process.cwd();
