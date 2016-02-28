#!/usr/bin/env node

const program = require(`commander`);
const pkg = require(__dirname + `/package`);
const lib = require(__dirname + `/lib`);

program
    .version(pkg.version)
    .description(pkg.description);

program
    .command(`init <username> <token> <remoteUri>`)
    .description(`Initialize this utility`)
    .action((username, token, remoteUri) => {
        lib.getScript(`init`)(username, token, remoteUri);
    });

program
    .command(`macro`)
    .option(`-t, --title <title>`, `Title of macro`)
    .option(`-f, --file <path>`, `Path to comment text file`)
    .option(`-w, --write`, `Open editor to write comment content`)
    .option(`-T, --tags <tags>`, `Append tags (space delineated)`)
    .option(`-i, --inactive`, `Make macro inactive`)
    .option(`-p, --private`, `Set comment mode to private`)
    .option(`-l, --list`, `List all macros`)
    .option(`-u, --update <id>`, `Update macro`, parseInt)
    .option(`-o, --open [id]`, `Open the macro in ZenDesk`, parseInt)
    .description(`Add a macro to ZenDesk`)
    .action ((options) => {
        lib.getScript(`macro`)(options);
    });

program.parse(process.argv);