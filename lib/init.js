const fs = require(`fs-extra`);

function init (username, token, remoteUri) {
    var config_path = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support/zendesk-cli' : '/var/local/zendesk-cli');  
    var config = {};

    if (username && token && remoteUri) {
        config = {
            username: username,
            token: token,
            remoteUri: remoteUri
        };

        fs.outputJson(`${config_path}/config.json`, config, (err) => {
            if (err) throw err;

            console.log();
            console.log(`    Successfully initialized. Use zd --help to see available commands.`);
            console.log();
        });
    } else {
        console.log();
        console.log(`    Must provide <username>, <token>, and <remoteUri>`);
        console.log();
    }
}

module.exports = init;