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
    .option(`-t, --title <title>`, `Set title of macro`)
    .option(`-f, --file <path>`, `Path to comment text file`)
    .option(`-w, --write`, `Open editor to write comment content`)
    .option(`-T, --tags <tags>`, `Append tags (space delineated)`)
    .option(`-i, --inactive`, `Make macro inactive`)
    .option(`-p, --private`, `Set comment mode to private`)
    .option(`-l, --list`, `List all macros`)
    .option(`-s, --sort <sort_by>`, `Sort macros in list view`)
    .option(`-u, --update <macro_id>`, `Update macro`, parseInt)
    .option(`-o, --open [macro_id]`, `Open the macro in ZenDesk`, parseInt)
    .description(`Add, update, list, open macros`)
    .action((options) => {
        lib.getScript(`macro`)(options);
    });

program
    .command('add <type>')
    .option(`-t, --title <title>`, `Set title of macro`)
    .option(`-f, --file <path>`, `Path to comment text file`)
    .option(`-w, --write`, `Open editor to write comment content`)
    .option(`-T, --tags <tags>`, `Append tags (space delineated)`)
    .option(`-i, --inactive`, `Make macro inactive`)
    .option(`-p, --private`, `Set comment mode to private`)
    .option(`-o, --open`, `Open the macro in browser after creating`)
    .description(`Add a macro or article`)
    .action((type, options) => {
        lib.getScript(type)(options);
    });

program
    .command(`update <type> <id>`)
    .option(`-t, --title <title>`, `Set title of macro`)
    .option(`-f, --file <path>`, `Path to comment text file`)
    .option(`-w, --write`, `Open editor to write comment content`)
    .option(`-T, --tags <tags>`, `Append tags (space delineated)`)
    .option(`-i, --inactive`, `Make macro inactive`)
    .option(`-p, --private`, `Set comment mode to private`)
    .option(`-o, --open`, `Open the macro in browser after updating`)
    .description(`Update a macro`)
    .action((type, id, options) => {
        options.update = parseInt(id);

        lib.getScript(type)(options);
    });

program
    .command(`list <type>`)
    .description(`Add a macro to ZenDesk`)
    .description(`List macros or articles.`)
    .action((type) => {
        var options = {
            list: true
        };

        if (type === 'macros') {
            type = 'macro';
        }

        if (type === 'articles') {
            type = 'article';
        }

        lib.getScript(type)(options);
    });

program
    .command(`open <type> <id>`)
    .description(`Open a macro or article in the browser`)
    .action((type, id) => {
        var options = {
            open: parseInt(id)
        };

        lib.getScript(type)(options);
    });

program.parse(process.argv);