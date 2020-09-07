const { decode } = require('bs58');
const KeyPair = require('near-api-js').KeyPair;
const exitOnError = require('../utils/exit-on-error');
const { parseSeedPhrase } = require('near-seed-phrase');

function implicitAccountId(publicKey) {
    return decode(publicKey.replace('ed25519:', '')).toString('hex');
}

module.exports = {
    command: 'generate-key [account-id]',
    desc: 'generate key or show key from Ledger',
    builder: (yargs) => yargs
        .options('seed-phrase', {
            desc: 'Seed phrase mnemonic',
            type: 'string',
            required: false
        })
        .options('seed-path', {
            desc: 'HD path derivation',
            type: 'string',
            default: "m/44'/397'/0'",
            required: false
        }),
    handler: exitOnError(async (argv) => {
        let near = await require('../utils/connect')(argv);

        if (argv.usingLedger) {
            if (argv.accountId) {
                console.log('WARN: Account id is provided but ignored in case of using Ledger.');
            }
            const publicKey = await argv.signer.getPublicKey();
            // NOTE: Command above already prints public key.
            console.log(`Implicit account: ${implicitAccountId(publicKey.toString())}`);
            // TODO: query all accounts with this public key here.
            // TODO: check if implicit account exist, and if the key doen't match already.
            return;
        }

        const { deps: { keyStore } } = near.config;
        const existingKey = await keyStore.getKey(argv.networkId, argv.accountId);
        if (existingKey) {
            console.log(`Account has existing key pair with ${existingKey.publicKey} public key`);
            return;
        }

        let publicKey, accountId;
        if (argv.seedPhrase) {
            const result = parseSeedPhrase(argv.seedPhrase, argv.seedPath);
            publicKey = result.publicKey;
            accountId = argv.accountId || implicitAccountId(publicKey);
        } else {
            const keyPair = KeyPair.fromRandom('ed25519');
            publicKey = keyPair.publicKey.toString();
            accountId = argv.accountId || implicitAccountId(publicKey);
            await keyStore.setKey(argv.networkId, accountId, keyPair);
        }
        console.log(`Key pair with ${publicKey} public key for account "${accountId}"`);
    })
};