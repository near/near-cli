
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { KeyPair } = require('near-api-js');
const eventtracking = require('../utils/eventtracking');

const createAccountCommand = {
    command: 'create-account <accountId>',
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
        .option('newLedgerKey', {
            desc: 'HD key path to use with Ledger. Used to generate public key if not specified directly',
            type: 'string',
            default: "44'/397'/0'/0'/1'"
        })
        .option('initialBalance', {
            desc: 'Number of tokens to transfer to newly created account',
            type: 'string',
            default: '100'
        }),
    handler: exitOnError(createAccount)
};

const createAccountCommandDeprecated = {
    command: 'create_account <accountId>',
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
        .option('newLedgerKey', {
            desc: 'HD key path to use with Ledger. Used to generate public key if not specified directly',
            type: 'string',
            default: "44'/397'/0'/0'/1'"
        })
        .option('initialBalance', {
            desc: 'Number of tokens to transfer to newly created account',
            type: 'string',
            default: '100'
        }),
    handler: exitOnError(async (options) => {
        console.log('near create_account is deprecated and will be removed in version 0.26.0. Please use near create-account.');
        await createAccount(options); })
}; 

async function createAccount(options) {
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
        await eventtracking.track(eventtracking.EVENT_ID_CREATE_ACCOUNT_END, { success: true, new_keypair: true }, options);
    } else {
        await eventtracking.track(eventtracking.EVENT_ID_CREATE_ACCOUNT_END, { success: true, new_keypair: false }, options);
    }
    console.log(`Account ${options.accountId} for network "${options.networkId}" was created.`);
}

module.exports = {
    createAccountCommand,
    createAccountCommandDeprecated
};
