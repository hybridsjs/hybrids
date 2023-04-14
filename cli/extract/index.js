import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { cwd, resolveFileOrDir } from "../utils/fs.js";

const HELP_MSG = `hybrids - translation message extractor from source files

Pass a single file or a directory, which will be recursively scanned 
for .js and .ts files with messages. If no output file is specified, 
the output will be pushed to stdout.

Usage:
hybrids extract [options] <file or directory> [<output file>]

Options:
-e, --empty-message\t Set default message body to empty string
-f, --force\t\t Overwrite output file instead of merge it with existing messages
-p, --include-path\t Include file path in message description
-h, --help\t\t Show this help

--format=type\t\t Transform messages to the desired format; supported types: chrome.i18n
`;

import task from "./task.js";

function normalizeOptions(options) {
  return {
    emptyMessage: options["empty-message"] || options.e,
    force: options.force || options.f,
    includePath: options["include-path"] || options.p,
    format: options.format,
  };
}

export default function extract(args, options) {
  options = normalizeOptions(options);

  if (args[0]) {
    const fileOrDirPath = resolve(cwd, args[0]);
    const targetPath = args[1] && resolve(cwd, args[1]);

    const messages = [];
    resolveFileOrDir(fileOrDirPath, (content, path) => {
      messages.push(
        ...task(content, options.format).map((m) => ({ ...m, path })),
      );
    });

    const getDesc = (text = "", path) => {
      return `${options.includePath && path ? `${path}:\n` : ""}${text}`;
    };

    const touched = new Set();
    const body = messages.reduce(
      (acc, m) => {
        const c = acc[m.key];
        let description =
          (m.description || options.includePath) &&
          getDesc(m.description, m.path);

        if (m.description) {
          description = `${
            touched.has(m.key) ? `${c.description}\n` : ""
          }${getDesc(m.description, m.path)}`;

          touched.add(m.key);
        }

        acc[m.key] = {
          message: options.emptyMessage ? c?.message ?? "" : m.message,
          ...c,
          description,
        };

        return acc;
      },
      !options.force && targetPath && existsSync(targetPath)
        ? JSON.parse(readFileSync(targetPath, "utf8"))
        : {},
    );

    const targetContent =
      JSON.stringify(
        Object.fromEntries(
          Object.entries(body).sort(([a], [b]) =>
            a.localeCompare(b, "en", { sensitivity: "base" }),
          ),
        ),
        null,
        2,
      ) + "\n";

    if (targetPath) {
      writeFileSync(targetPath, targetContent);
    } else {
      console.log(targetContent);
    }
  } else if (!args.length || options.help) {
    console.log(HELP_MSG);
    process.exit(1);
  }
}
