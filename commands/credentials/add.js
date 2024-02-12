const { DEFAULT_NETWORK } = require('../../config');
const { parseSeedPhrase } = require('near-seed-phrase');
const { storeCredentials } = require('../../utils/credentials');
const { KeyPair } = require('near-api-js');

module.exports = {
    command: 'add-credentials <account-id>',
    desc: 'Store credentials locally to use them later to deploy, call, etc.',
    builder: (yargs) => yargs
        .option('secretKey', {
            desc: 'Secret key for the account',
            type: 'string',
            required: false,
        })
        .option('seedPhrase', {
            desc: 'Seed phrase from which to derive the access-key',
            type: 'string',
            required: false,
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        })
        .option('force', {
            desc: 'Force storing the key even if the account already has one',
            type: 'boolean',
            default: false
        })
        .conflicts('secretKey', 'seedPhrase'),
    handler: importAccount
};

async function importAccount(options) {
    if (!options.secretKey && !options.seedPhrase) return console.log('Provide a secret key or a seed phrase.');

    let secretKey;

    if (options.secretKey) {
        console.log(`Importing account ${options.accountId} with secret key.`);
        secretKey = options.secretKey;
    }

    if (options.seedPhrase) {
        console.log(`Importing account ${options.accountId} with seed phrase.`);
        secretKey = parseSeedPhrase(options.seedPhrase).secretKey;
    }

    const keyPair = KeyPair.fromString(secretKey);

    // store it
    storeCredentials(options.accountId, options.networkId, options.keyStore, keyPair, options.force);
}
