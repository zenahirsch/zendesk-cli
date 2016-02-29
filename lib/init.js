const fs = require(`fs`);

function init (username, token, remoteUri) {
    var config = {};

    if (username && token && remoteUri) {
        config = {
            username: username,
            token: token,
            remoteUri: remoteUri
        };

        fs.writeFile(`${__dirname}/config.json`, JSON.stringify(config, null, 2), (err) => {
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