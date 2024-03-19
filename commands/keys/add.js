const { utils } = require('near-api-js');
const connect = require('../../utils/connect');
const { DEFAULT_NETWORK } = require('../../config');
const inspectResponse = require('../../utils/inspect-response');
const { assertCredentials } = require('../../utils/credentials');

module.exports = {
    command: 'add-key <account-id> <public-key>',
    desc: 'Add an access key to a given account',
    builder: (yargs) => yargs
        .option('contractId', {
            desc: 'Limit access key to given contract (if not provided - will create full access key)',
            type: 'string',
            required: false,
        })
        .option('methodNames', {
            desc: 'Method names to limit access key to (example: --method-names meth1 meth2)',
            type: 'array',
            required: false,
            default: []
        })
        .option('allowance', {
            desc: 'Allowance in $NEAR for the key (default 0)',
            type: 'string',
            required: false,
            default: '0'
        })
        .option('signWithLedger', {
            alias: ['useLedgerKey'],
            desc: 'Use Ledger for signing',
            type: 'boolean',
            default: false
        })
        .option('ledgerPath', {
            desc: 'HD key path',
            type: 'string',
            default: "44'/397'/0'/0'/1'"
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        }),
    handler: addAccessKey
};

async function addAccessKey(options) {
    await assertCredentials(options.accountId, options.networkId, options.keyStore, options.useLedgerKey);

    console.log(`Adding ${options.contractId ? 'function call access' : 'full access'} key ${options.publicKey} to ${options.accountId}.`);
    if (options.contractId) console.log(`Limited to: ${options.allowance} $NEAR and methods: [${options.methodNames.join(' ')}].`);

    const near = await connect(options);
    const account = await near.account(options.accountId);
    const allowance = utils.format.parseNearAmount(options.allowance);

    try {
        const response = await account.addKey(options.publicKey, options.contractId, options.methodNames, allowance);
        console.log('\nKey added to account, but not stored locally.');
        inspectResponse.prettyPrintResponse(response, options);
    } catch (error) {
        if (error.type !== 'AddKeyAlreadyExists') throw error;
        console.log(`\nAccess key ${options.publicKey} already exists in account ${options.accountId}.`);
    }
}
