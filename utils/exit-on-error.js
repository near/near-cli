const eventtracking = require('./eventtracking');
const inspectResponse = require('./inspect-response');

/* `yargs` puts rich objects on the `options` object, which could include sensitive data (like a keystore!).
 * This ensures we only put explicit, known non-private data that is relevant to tracking into the environment
 * when we run `log-event.js`
 */
function getNonPrivateDataFromCmdlineOpts(options) {
    return {
        accountId: options.accountId,
        networkId: options.networkId,
        nodeUrl: options.nodeUrl,
        walletUrl: options.walletUrl,
    };
}

// This is a workaround to get Mixpanel to log a crash
process.on('exit', () => {
    const crashEventProperties = {
        near_cli_command: process.env.NEAR_CLI_ERROR_LAST_COMMAND,
        error_message: process.env.NEAR_CLI_LAST_ERROR
    };
    require('child_process').fork(__dirname + '/log-event.js', ['node'], {
        silent: true,
        detached: true,
        env: {
            NEAR_CLI_EVENT_ID: eventtracking.EVENT_ID_ERROR,
            NEAR_CLI_EVENT_DATA: JSON.stringify(crashEventProperties),
            NEAR_CLI_OPTIONS: process.env.NEAR_CLI_OPTIONS
        }
    });
});

module.exports = (promiseFn) => async (...args) => {
    const command = args[0]['_'];
    process.env.NEAR_CLI_ERROR_LAST_COMMAND = command;
    process.env.NEAR_CLI_NETWORK_ID = require('../get-config')()['networkId'];
    const options = args[0];
    const optionsAsStr = JSON.stringify(getNonPrivateDataFromCmdlineOpts(options));
    const eventId = `event_id_shell_${command}_start`;
    require('child_process').fork(__dirname + '/log-event.js', ['node'], {
        silent: true,
        detached: true,
        env: {
            NEAR_CLI_EVENT_ID: eventId,
            NEAR_CLI_EVENT_DATA: JSON.stringify({}),
            NEAR_CLI_OPTIONS: optionsAsStr
        }
    });
    const promise = promiseFn.apply(null, args);
    try {
        await promise;
    } catch (e) {
        process.env.NEAR_CLI_LAST_ERROR = e.message;
        process.env.NEAR_CLI_OPTIONS = optionsAsStr;
        inspectResponse.prettyPrintError(e, options);
        process.exit(1);
    }
};