
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { KeyPair } = require('near-api-js');
const inspectResponse = require('../utils/inspect-response');
const checkCredentials = require('../utils/check-credentials');
// Top-level account (TLA) is testnet for foo.alice.testnet
const TLA_MIN_LENGTH = 32;

const createAccountCommand = {
    command: 'create-account <accountId>',
    desc: 'create a new developer account (subaccount of the masterAccount, ex: app.alice.test)',
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
    await checkCredentials(options.masterAccount, options.networkId, options.keyStore);
    // NOTE: initialBalance is passed as part of config here, parsed in middleware/initial-balance
    // periods are disallowed in top-level accounts and can only be used for subaccounts
    const splitAccount = options.accountId.split('.');
    const splitMaster = options.masterAccount.split('.');
    const masterRootTLA = splitMaster[splitMaster.length - 1];
    if (splitAccount.length === 1) {
        // TLA (bob-with-at-least-maximum-characters)
        if (splitAccount[0].length < TLA_MIN_LENGTH) {
            throw new Error(`Top-level accounts must be at least ${TLA_MIN_LENGTH} characters.\n` +
              'Note: this is for advanced usage only. Typical account names are of the form:\n' +
              'app.alice.test, where the masterAccount shares the top-level account (.test).'
            );
        }
    } else if (splitAccount.length > 1) {
        // Subaccounts (short.alice.near, even.more.bob.test, and eventually peter.potato)
        // Check that master account TLA matches
        if (!options.accountId.endsWith(`.${options.masterAccount}`)) {
            throw new Error(`New account doesn't share the same top-level account. Expecting account name to end in ".${options.masterAccount}"`);
        }

        // Warn user if account seems to be using wrong network, where TLA is captured in config
        // TODO: when "network" key is available, revisit logic to determine if user is on proper network
        // See: https://github.com/near/near-cli/issues/387
        if (options.helperAccount && masterRootTLA !== options.helperAccount) {
            console.log(`NOTE: In most cases, when connected to network "${options.networkId}", masterAccount will end in ".${options.helperAccount}"`);
        }
    }
    let near = await connect(options);
    let keyPair;
    let publicKey;
    let keyRootPath;
    let keyFilePath;
    if (options.publicKey) {
        publicKey = options.publicKey;
    } else {
        keyPair = await KeyPair.fromRandom('ed25519');
        publicKey = keyPair.getPublicKey();
    }
    // Check to see if account already exists
    try {
        // This is expected to error because the account shouldn't exist
        const account = await near.account(options.accountId);
        await account.state();
        throw new Error(`Sorry, account '${options.accountId}' already exists.`);
    } catch (e) {
        if (!e.message.includes('does not exist while viewing')) {
            throw e;
        }
    }
    if (keyPair) {
        if (near.connection.signer.keyStore.keyStores.length) {
            keyRootPath = near.connection.signer.keyStore.keyStores[0].keyDir;
        }
        keyFilePath = `${keyRootPath}/${options.networkId}/${options.accountId}.json`;
        console.log(`Saving key to '${keyFilePath}'`);
        await near.connection.signer.keyStore.setKey(options.networkId, options.accountId, keyPair);
    }
    
    // Create account
    try {
        const response = await near.createAccount(options.accountId, publicKey);
        inspectResponse.prettyPrintResponse(response, options);
        console.log(`Account ${options.accountId} for network "${options.networkId}" was created.`);
        
    } catch(error) {
        if (error.type === 'RetriesExceeded') {
            console.warn('Received a timeout when creating account, please run:');
            console.warn(`near state ${options.accountId}`);
            console.warn('to confirm creation. Keyfile for this account has been saved.');
        } else {
            if (!options.usingLedger) await near.connection.signer.keyStore.removeKey(options.networkId, options.accountId);
            throw error;
        }
    }
}

module.exports = {
    createAccountCommand,
    createAccountCommandDeprecated
};
