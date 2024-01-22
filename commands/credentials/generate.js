const { decode } = require('bs58');
const { generateSeedPhrase, parseSeedPhrase } = require('near-seed-phrase');
const { DEFAULT_NETWORK } = require('../../config');
const { storeCredentials } = require('../../utils/credentials');
const { KeyPair } = require('near-api-js');

module.exports = {
    command: 'generate-key [account-id]',
    desc: 'Create a key-pair (optionally, save it as credentials for an account)',
    builder: (yargs) => yargs
        .option('fromSeedPhrase', {
            desc: 'generate key-pair from a seed phrase (e.g. "word-1 word-2 ... word-11 word-12")',
            type: 'string',
            required: false,
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet',
            type: 'string',
            default: DEFAULT_NETWORK
        })
        .option('force', {
            desc: 'Force storing the key even if the account already has one',
            type: 'boolean',
            default: false
        }),
    handler: generateKey
};

function pKtoAccountId(publicKey) {
    return decode(publicKey.replace('ed25519:', '')).toString('hex');
}

async function generateKey(options) {
    let secret;

    if (options.fromSeedPhrase) {
        const { publicKey, secretKey } = parseSeedPhrase(options.fromSeedPhrase);
        console.log(`Seed phrase: ${options.fromSeedPhrase}`);
        console.log(`Key pair: ${JSON.stringify({ publicKey, secretKey })}`);
        console.log(`Implicit account: ${pKtoAccountId(publicKey)}`);
        secret = secretKey;
    } else {
        const { seedPhrase, publicKey, secretKey } = generateSeedPhrase();
        console.log(`Seed phrase: ${seedPhrase}`);
        console.log(`Key pair: ${JSON.stringify({ publicKey, secretKey })}`);
        console.log(`Implicit account: ${pKtoAccountId(publicKey)}`);
        secret = secretKey;
    }

    if (options.accountId) {
        const keyPair = KeyPair.fromString(secret);
        storeCredentials(options.accountId, options.networkId, options.keyStore, keyPair, options.force);
    }
}