const mkdirp = require(`mkdirp`);
const fs = require(`fs`);
const zendesk = require(`node-zendesk`);
const columnify = require(`columnify`);
const open = require(`open`);
const assert = require(`assert`);
const spawn = require(`child_process`).spawn;
const config = require(`./config`);
let client = null;

function setupClient () {
    try {
        client = zendesk.createClient({
            username: config.username,
            token: config.token,
            remoteUri: config.remoteUri
        });

        return true;
    } catch (err) {
        console.log();
        console.log(`    Missing config. Run \`zd init\``);
        console.log();
        return false;
    }
}

function macro (options) {
    if (!setupClient()) {
        return;
    }

    if (!options.file && !options.write && !options.update && !options.list && !options.export && !options.bulkUpdate && !options.open) {
        console.log();
        console.log(`    Please use one of the following: -f, -w, -l, -e, -u, -b, -o`);
        console.log(`    Or try \`zd macro --help\``);
        console.log();
        return;
    }

    if (options.open && Number.isInteger(options.open)) {
        return openMacro(options.open);
    }

    if (options.file) {
        readCommentFromFile(options.file, (comment) => {
            buildMacro(comment, options);
        });
    } else if (options.write) {
        writeComment((comment) => {
            buildMacro(comment, options);
        });
    } else if (options.list) {
        listMacros(options);
    } else if (options.export) {
        exportMacros(options);
    } else if (options.bulkUpdate) {
        bulkUpdateMacros(options);
    } else {
        buildMacro(null, options); // build macro with no comment
    }
}

function readCommentFromFile (path, callback) {
    callback(fs.readFileSync(path, `utf8`));
}

function writeComment (callback) {
    const time = Date.parse(new Date());
    const path = `${process.env.HOME}/.zendesk-cli`;

    mkdirp(path, (err) => {
        if (err) throw err;

        var vim = spawn(process.env.EDITOR || `vim`, [`${path}/${time}.md`], {stdio: `inherit`});

        vim.on(`close`, () => {
            console.log(`Saved to ${path}/${time}.md`);

            callback(fs.readFileSync(`${path}/${time}.md`, `utf8`));
        });
    });
}

function buildMacro (comment, options) {
    var data = {
        macro: {
            title: options.title ? options.title : `Untitled macro`,
            active: options.inactive ? false : true,
            actions: [{
                field: `comment_mode_is_public`,
                value: options.private ? false : true
            }]
        }
    };

    if (options.tags) {
        data.macro.actions.push({
            field: `current_tags`,
            value: options.tags
        });
    }

    if (options.type) {
        const types = [`question`, `incident`, `problem`, `task`];

        if (types.indexOf(options.type) > -1) { // make sure it's a valid type
            data.macro.actions.push({
                field: `type`,
                value: options.type
            });
        } else {
            console.log(`${options.type} is not a valid type, ignoring that parameter`);
        }
    }

    if (options.status) {
        const statuses = [`open`, `pending`, `hold`, `solved`];

        if (statuses.indexOf(options.status) > -1) {
            data.macro.actions.push({
                field: `status`,
                value: options.status
            });
        } else {
            console.log(`${options.status} is not a valid status, ignoring that parameter`);
        }
    }

    if (comment) {
        data.macro.actions.push({
            field: `comment_value`,
            value: comment
        });
    }

    if (options.update && !isNaN(options.update)) {
        updateMacro(options.update, data, options);
    } else if (options.update && isNaN(options.update)) {
        return console.log('Must pass macro ID with options -u');
    } else {
        createMacro(data, options);
    }
}

function createMacro (data, options) {
    client.macros.create(data, (err, req, result) => {
        if (err) throw err;

        console.log();
        console.log(`    Created macro ${result.macro.id}`);
        console.log();

        if (options.open) {
            openMacro(result.macro.id);
        }
    });
}

function listMacros (options) {
    client.macros.listByParams({
        sort_by: options.sort ? options.sort : `alphabetical`
    }, (err, req, result) => {  
        if (err) throw err;

        var columns = columnify(result, {
            columns: ['id', 'title', 'active'],
            config: {
                title: { 
                    maxWidth: 45,
                    truncate: true
                }
            }
        });

        console.log();
        console.log(columns);     
        console.log();   
    });
}

function exportMacros (options) {
    client.macros.listByParams({
        sort_by: options.sort ? options.sort : `alphabetical`
    }, (err, req, result) => {  
        if (err) throw err;

        let file_name = options.export ? options.export : `exported_macros.json`;

        fs.writeFile(file_name, JSON.stringify(result, null, 2), (err) => {
            if (err) {
                return console.log(err);
            }

            console.log(`Macros saved to ${file_name}`);
        });  
    });
}

function updateMacro (id, data, options) {
    client.macros.update(id, data, (err, req, result) => {
        if (err) throw err;

        console.log();
        console.log(`    Updated macro ${result.macro.id}`);
        console.log();

        if (options.open) {
            openMacro(result.macro.id);
        }
    });
}

function bulkUpdateMacros (options) {
    client.macros.listByParams({
        sort_by: options.sort ? options.sort : `alphabetical`
    }, (err, req, result) => {  
        if (err) throw err;
        let edited_macros = JSON.parse(fs.readFileSync(options.bulkUpdate, 'utf8'));
        let diff_macros = [];

        result.every((current_macro) => {
            edited_macros.every((edited_macro) => {
                if (edited_macro.id === current_macro.id) {
                    try {
                        assert.deepEqual(current_macro, edited_macro);
                    } catch (err) {
                        console.log(`    Macro ${current_macro.id} was edited.`);
                        diff_macros.push(edited_macro);
                    }
                    return false;
                }

                return true;
            });

            return true;
        });

        console.log('The different macros: ', diff_macros);

        diff_macros.forEach((macro) => {
            client.macros.update(macro.id, { "macro": macro }, (err, req, result) => {
                if (err) throw err;
                console.log(`Macro ${macro.id} updated.`);
            });
        });
    });
}

function openMacro (id) {
    const regex = /(http:\/\/)?(([^.]+)\.)?zendesk\.com/g;
    var subdomain = config.remoteUri.match(regex, `$3`);

    open(`${subdomain}/agent/admin/macros/${id}`);
}

module.exports = macro;