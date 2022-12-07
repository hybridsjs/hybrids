#!/usr/bin/env node

import extract from "./extract/index.js";
import { resolveOptions } from "./utils/fs.js";

const [, , command, ...commandArgs] = process.argv;
const { args, options } = resolveOptions(commandArgs);

const HELP_MSG = `Usage: hybrids <command> [options]

Commands:
extract\t Extract translation messages from file or directory
help\t Show this help

Run command without arguments to see usage.
`;

switch (command) {
  case "extract":
    extract(args, options);
    break;
  default: {
    console.log(HELP_MSG);
    process.exit(1);
  }
}
