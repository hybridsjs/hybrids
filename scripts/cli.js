#!/usr/bin/env node
/* eslint-disable no-fallthrough */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  lstatSync,
  realpathSync,
} from "fs";
import { resolve } from "path";

import extract from "./extract.js";

const cwd = process.cwd();

function resolveOptions(args) {
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

  return { rest, options };
}

function resolveFileOrDir(path, cb) {
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

function extractCommand(args) {
  const { rest, options } = resolveOptions(args);

  if (rest[0]) {
    const fileOrDirPath = resolve(cwd, rest[0]);
    const targetPath = rest[1] && resolve(cwd, rest[1]);

    const messages = [];
    resolveFileOrDir(fileOrDirPath, (content, path) => {
      messages.push(
        ...extract(content, options.format).map((m) => ({ ...m, path })),
      );
    });

    const getDesc = (text, path) => {
      return `${
        (options.p || options["include-path"]) && path ? `${path}:\n` : ""
      }${text}`;
    };

    const touched = new Set();
    const body = messages.reduce(
      (acc, m) => {
        const c = acc[m.key];
        let description = m.description && getDesc(m.description, m.path);

        if (m.description) {
          if (touched.has(m.key)) {
            description = `${c.description}\n${getDesc(m.description, m.path)}`;
          } else {
            touched.add(m.key);
            description = m.description;
          }
        }

        acc[m.key] = {
          message: options.e || options["empty-message"] ? "" : m.message,
          ...c,
          description,
        };

        return acc;
      },
      !(options.f || options.force) && targetPath && existsSync(targetPath)
        ? JSON.parse(readFileSync(targetPath, "utf8"))
        : {},
    );

    const targetContent = JSON.stringify(
      Object.fromEntries(
        Object.entries(body).sort(([a], [b]) =>
          a.localeCompare(b, "en", { sensitivity: "base" }),
        ),
      ),
      null,
      2,
    );

    if (targetPath) {
      writeFileSync(targetPath, targetContent);
    } else {
      console.log(targetContent);
    }
  } else if (!args.length || options.h || options.help) {
    console.log(
      `hybrids - message extractor from source files

Pass a single file or a directory, which will be recursively scanned 
for .js and .ts files with messages. If no output file is specified, the output 
will be pushed to stdout.

Usage:
hybrids extract [options] <file or directory> [<output file>]

Options:
-e, --empty-message\t Set default message body to empty string
-f, --force\t\t Overwrite output file instead of merge it with existing messages
-p, --include-path\t Include path in message description
-h, --help\t\t Show this help

--format=type\t\t Transform messages to the desired format; supported types: chrome.i18n
`,
    );

    process.exit(1);
  }
}

function helpCommand() {
  console.log(
    `Usage: hybrids <command> [options]

Commands:
extract\t Extract messages from file or directory
help\t\t Show this help

Run command without arguments to see usage.`,
  );

  process.exit(1);
}

const [, , command, ...args] = process.argv;

switch (command) {
  case "extract":
    extractCommand(args);
    break;
  default:
    helpCommand();
}
