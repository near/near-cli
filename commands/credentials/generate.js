const { decode } = require('bs58');
const { generateSeedPhrase, parseSeedPhrase } = require('near-seed-phrase');
const { DEFAULT_NETWORK } = require('../../config');
const { storeCredentials } = require('../../utils/credentials');
const { KeyPair } = require('near-api-js');

module.exports = {
    command: 'generate-key [account-id]',
    desc: 'Create and display a key-pair (optionally, save it as credentials for an account)',
    builder: (yargs) => yargs
        .option('fromSeedPhrase', {
            alias: 'seedPhrase',
            desc: 'Generate key-pair from a seed phrase (e.g. "word-1 word-2 ... word-11 word-12")',
            type: 'string',
            required: false,
        })
        .option('saveImplicit', {
            desc: 'Save the key as credentials for the implicit account',
            type: 'boolean',
            default: false
        })
        .option('queryLedgerPK', {
            alias: ['useLedgerKey'],
            desc: 'Save the key as credentials for the implicit account',
            type: 'boolean',
            default: false
        })
        .option('ledgerPath', {
            desc: 'Path to the Ledger key',
            type: 'string',
            default: "44'/397'/0'/0'/1'"
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
        }),
    handler: generateKey
};

function pKtoAccountId(publicKey) {
    return Buffer.from(decode(publicKey.replace('ed25519:', ''))).toString('hex');
}

async function generateKey(options) {
    let secret;

    if (options.queryLedgerPK) {
        const { getPublicKeyForPath } = require('../../utils/ledger');
        const publicKey = await getPublicKeyForPath(options.ledgerPath);
        console.log(`Public key: ${publicKey}`);
        console.log(`Implicit account: ${pKtoAccountId(publicKey.toString())}`);
        return;
    }

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

    const keyPair = KeyPair.fromString(secret);
    if (options.accountId) {
        storeCredentials(options.accountId, options.networkId, options.keyStore, keyPair, options.force);
    }

    if (options.saveImplicit) {
        const implicit = pKtoAccountId(keyPair.getPublicKey().toString());
        storeCredentials(implicit, options.networkId, options.keyStore, keyPair, options.force);
    }
}