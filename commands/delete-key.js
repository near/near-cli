const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const eventtracking = require('../utils/eventtracking');
const inspectResponse = require('../utils/inspect-response');

module.exports = {
    command: 'delete-key [accessKey]',
    desc: 'delete access key',
    builder: (yargs) => yargs
        .option('accessKey', {
            desc: 'Public key to delete (base58 encoded)',
            type: 'string',
            required: true,
        }),
    handler: exitOnError(deleteAccessKey)
};

async function deleteAccessKey(options) {
    await eventtracking.track(eventtracking.EVENT_ID_DELETE_KEY_START, { amount: options.amount }, options);
    console.log(`Deleting key = ${options.accessKey} on ${options.accountId}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const result = await account.deleteKey(options.accessKey);
    console.log(inspectResponse(result));
    await eventtracking.track(eventtracking.EVENT_ID_DELETE_KEY_END, { success: true }, options);
}
