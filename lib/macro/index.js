const mkdirp = require(`mkdirp`);
const fs = require(`fs`);
const zendesk = require('node-zendesk');
const columnify = require(`columnify`);
const open = require(`open`);
const spawn = require(`child_process`).spawn;
const config = require(`../../config.json`);

const client = zendesk.createClient({
    username: config.username,
    token: config.token,
    remoteUri: config.remoteUri
});

function macro (options) {
    if (options.file) {
        readCommentFromFile(options.file, (comment) => {
            buildMacro(comment, options);
        });
    } else if (options.write) {
        writeComment((comment) => {
            buildMacro(comment, options);
        });
    } else if (options.list) {
        listMacros();
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
            title: `Title of macro`,
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

        console.log(`Created macro ${result.macro.id}`);

        if (options.open) {
            openMacro(result.macro.id);
        }
    });
}

function listMacros () {
    client.macros.list((err, req, result) => {
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

function updateMacro (id, data, options) {
    client.macros.update(id, data, (err, req, result) => {
        if (err) throw err;

        console.log(`Updated macro ${result.macro.id}`);

        if (options.open) {
            openMacro(result.macro.id);
        }
    });
}

function openMacro (id) {
    open(`https://vimeo.zendesk.com/agent/admin/macros/edit/${id}`);
}

module.exports = macro;