
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { KeyPair } = require('near-api-js');
const eventtracking = require('../utils/eventtracking');
// Top-level account (TLA) is testnet for foo.alice.testnet
const TLA_MIN_LENGTH = 32;

module.exports = {
    command: 'create_account <accountId>',
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

async function createAccount(options) {
    await eventtracking.track(eventtracking.EVENT_ID_CREATE_ACCOUNT_START, { nodeUrl: options.nodeUrl });
    // NOTE: initialBalance is passed as part of config here, parsed in middleware/initial-balance
    // periods are disallowed in top-level accounts and can only be used for subaccounts
    const splitAccount = options.accountId.split('.');

    const splitMaster = options.masterAccount.split('.');
    const masterRootTLA = splitMaster[splitMaster.length - 1];
    if (splitAccount.length === 1) {
        // TLA (bob-with-at-least-maximum-characters)
        if (splitAccount[0].length < TLA_MIN_LENGTH) {
            console.log(`Top-level accounts must be at least ${TLA_MIN_LENGTH} characters.\n` +
              'Note: this is for advanced usage only. Typical account names are of the form:\n' +
              'app.alice.test, where the masterAccount shares the top-level account (.test).'
            );
            return;
        }
    } else if (splitAccount.length > 1) {
        // Subaccounts (short.alice.near, even.more.bob.test, and eventually peter.potato)
        // Check that master account TLA matches
        if (!options.accountId.endsWith(`.${options.masterAccount}`)) {
            console.log(`New account doesn't share the same top-level account. Expecting account name to end in ".${options.masterAccount}"`);
            return;
        }

        // Warn user if account seems to be using wrong network, where TLA is captured in config
        // TODO: when "network" key is available, revisit logic to determine if user is on proper network
        // See: https://github.com/near/near-shell/issues/387
        if (options.helperAccount && masterRootTLA !== options.helperAccount) {
            console.log(`NOTE: In most cases, when connected to network "${options.networkId}", masterAccount will end in ".${options.helperAccount}"`);
        }
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
    await eventtracking.track(eventtracking.EVENT_ID_CREATE_ACCOUNT_END, { node: options.nodeUrl, success: true });
}
