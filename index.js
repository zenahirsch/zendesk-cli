#!/usr/bin/env node

const program = require(`commander`);
const pkg = require(__dirname + `/package`);
const lib = require(__dirname + `/lib`);

program
    .version(pkg.version)
    .description(pkg.description);

program
    .command(`macro`)
    .option(`-f, --file <path>`, `Path to comment text file`)
    .option(`-w, --write`, `Open editor to write comment content`)
    .option(`-t, --tags <tags>`, `Append tags (space delineated)`)
    .option(`-A, --inactive`, `Make macro inactive`)
    .option(`-p, --private`, `Set comment mode to private`)
    .option(`-l, --list`, `List all macros`)
    .option(`-u, --update <id>`, `Update macro`, parseInt)
    .option(`-o, --open [id]`, `Open the macro in ZenDesk`)
    .description(`Add a macro to ZenDesk`)
    .action ((options) => {
        lib.getScript(`macro`)(options);
    });

program.parse(process.argv);