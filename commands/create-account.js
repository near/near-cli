const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { KeyPair } = require('near-api-js');
const NEAR_ENV_SUFFIXES = [
    'near',
    'test',
    'beta',
    'dev'
];
const TLA_MIN_LENGTH = 11;

module.exports = {
    command: 'create_account <accountId>',
    desc: 'create a new developer account (top-level account 11+ chars, or a subdomain of the masterAccount)',
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
    // NOTE: initialBalance is passed as part of config here, parsed in middleware/initial-balance
    // periods are disallowed in top-level accounts and can only be used for subdomains
    const splitAccount = options.accountId.split('.');
    if (splitAccount.length === 2) {
        // TLA (bob-at-least-maximum-chars.test)
        if (splitAccount[0].length < TLA_MIN_LENGTH) {
            console.log(`Top-level accounts (not ending in .near, .test, etc) must be greater than ${TLA_MIN_LENGTH} characters`);
            return;
        }
    } else if (splitAccount.length === 3) {
        // Subdomain (short.alice.near)
        if (!NEAR_ENV_SUFFIXES.includes(splitAccount[2])) {
            console.log(`Expected a subdomain account name ending in ${NEAR_ENV_SUFFIXES.join(', ')}. (Example: counter.alice.test)`);
            return;
        }
    } else {
        console.log('Unexpected account name format. Please use one of these formats:\n' +
        `1. Top-level name with ${TLA_MIN_LENGTH}+ characters (ex: near-friend.test)\n` +
        `2. A subdomain account name ending with .${NEAR_ENV_SUFFIXES.join(', .')}. (Example: counter.alice.test)`);
        return;
    }
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
}
