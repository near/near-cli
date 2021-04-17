const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const { utils } = require('near-api-js');
const checkCredentials = require('../utils/check-credentials');

module.exports = {
    command: 'add-key <account-id> <access-key>',
    desc: 'Add an access key to given account',
    builder: (yargs) => yargs
        .option('access-key', {
            desc: 'Public key to add (base58 encoded)',
            type: 'string',
            required: true,
        })
        .option('contract-id', {
            desc: 'Limit access key to given contract (if not provided - will create full access key)',
            type: 'string',
            required: false,
        })
        .option('method-names', {
            desc: 'Method names to limit access key to (example: --method-names meth1 meth2)',
            type: 'array',
            required: false,
        })
        .option('allowance', {
            desc: 'Allowance in $NEAR for the key (default 0)',
            type: 'string',
            required: false,
        }),
    handler: exitOnError(addAccessKey)
};

async function addAccessKey(options) {
    await checkCredentials(options.accountId, options.networkId, options.keyStore);
    console.log(`Adding ${options.contractId ? 'function call access' : 'full access'} key = ${options.accessKey} to ${options.accountId}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const allowance = utils.format.parseNearAmount(options.allowance);
    const result = await account.addKey(options.accessKey, options.contractId, options.methodNames, allowance);
    inspectResponse.prettyPrintResponse(result, options);
}
