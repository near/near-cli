const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
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
    console.log(`Deleting key = ${options.accessKey} on ${options.accountId}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const result = await account.deleteKey(options.accessKey);
    inspectResponse.prettyPrintResponse(result, options);
}
