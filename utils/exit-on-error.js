// This is a workaround to get Mixpanel to log a crash
process.on('exit', () => {
    require('child_process').fork(__dirname + '/crash-error-report.js', ['node'], {
        silent: true,
        detached: true,
        env: {
            NEAR_CLI_ERROR_LAST_COMMAND: process.env.NEAR_CLI_ERROR_LAST_COMMAND,
            NEAR_CLI_LAST_ERROR: process.env.NEAR_CLI_LAST_ERROR,
            NEAR_CLI_NETWORK_ID: process.env.NEAR_CLI_NETWORK_ID,
            NEAR_CLI_OPTIONS: process.env.NEAR_CLI_OPTIONS
        }
    });
});

module.exports = (promiseFn) => async (...args) => {
    process.env.NEAR_CLI_ERROR_LAST_COMMAND = args[0]['_'];
    process.env.NEAR_CLI_NETWORK_ID = require('../get-config')()['networkId'];
    const promise = promiseFn.apply(null, args);
    try {
        await promise;
    } catch (e) {
        process.env.NEAR_CLI_LAST_ERROR = e.message;
        process.env.NEAR_CLI_OPTIONS = args;
        console.log('Error: ', e);
        process.exit(1);
    }
};