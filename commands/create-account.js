
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { KeyPair } = require('near-api-js');
const eventtracking = require('../utils/eventtracking');

module.exports = {
    command: 'create_account <accountId>',
    desc: 'create a new developer account',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'Unique identifier for the newly created account',
            type: 'string',
            required: true
        })
        .option('masterAccount', {
            desc: 'Account used to create requested account.',
            type: 'string',
            required: true
        })
        .option('publicKey', {
            desc: 'Public key to initialize the account with',
            type: 'string',
            required: false
        })
        .option('initialBalance', {
            desc: 'Number of tokens to transfer to newly created account',
            type: 'string',
            default: '100'
        }),
    handler: exitOnError(createAccount)
};

async function createAccount(options) {
    await eventtracking.track(eventtracking.EVENT_ID_CREATE_ACCOUNT_START, { nodeUrl: options.nodeUrl });
    // NOTE: initialBalance is passed as part of config here, parsed in middleware/initial-balance
    let near = await connect(options);
    let keyPair;
    let publicKey;
    if (options.publicKey) {
        publicKey = options.publicKey;
    } else {
        keyPair = await KeyPair.fromRandom('ed25519');
        publicKey = keyPair.getPublicKey();
    }
    await near.createAccount(options.accountId, publicKey);
    if (keyPair) {
        await near.connection.signer.keyStore.setKey(options.networkId, options.accountId, keyPair);
    }
    console.log(`Account ${options.accountId} for network "${options.networkId}" was created.`);
    await eventtracking.track(eventtracking.EVENT_ID_CREATE_ACCOUNT_END, { node: options.nodeUrl, success: true });
}
