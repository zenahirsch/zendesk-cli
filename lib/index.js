module.exports = {
    getScript: function (cmd) {
        try {
            return require(`./${cmd}`);
        } catch (err) {
            console.log();
            console.log(`    That command does not exist.`);
            console.log();
        }
    }
};
