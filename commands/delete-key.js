const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const eventtracking = require('../utils/eventtracking');

module.exports = {
    command: 'delete-key <account-id> <access-key>',
    desc: 'delete access key',
    builder: (yargs) => yargs
        .option('access-key', {
            desc: 'Public key to delete (base58 encoded)',
            type: 'string',
            required: true,
        }),
    handler: exitOnError(deleteAccessKey)
};

async function deleteAccessKey(options) {
    await eventtracking.askForId(options);
    console.log(`Deleting key = ${options.accessKey} on ${options.accountId}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const result = await account.deleteKey(options.accessKey);
    inspectResponse.prettyPrintResponse(result, options);
}
