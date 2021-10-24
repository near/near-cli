const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const checkCredentials = require('../utils/check-credentials');

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
    await checkCredentials(options.accountId, options.networkId, options.keyStore);
    console.log(`Deleting key = ${options.accessKey} on ${options.accountId}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    let accessKeys = await account.getAccessKeys();
    let fullAccessKeys = accessKeys.filter(accessKey => accessKey.access_key.permission === 'FullAccess');

    if(fullAccessKeys.length === 1 && fullAccessKeys[0].public_key.includes(options.accessKey)){
        console.log('You can\'t delete last FullAccess key');
    } else {
        const result = await account.deleteKey(options.accessKey);
        inspectResponse.prettyPrintResponse(result, options);
    }
}
