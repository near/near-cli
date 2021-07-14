const KeyPair = require('near-api-js').KeyPair;
const exitOnError = require('../utils/exit-on-error');
const implicitAccountId = require('../utils/implicit-accountid');

module.exports = {
    command: 'generate-key [account-id]',
    desc: 'generate key or show key from Ledger',
    builder: (yargs) => yargs
        .option('yolo', {
            description: 'Do not ask for extra confirmation when using Ledger',
            type: 'boolean',
        }),
    handler: exitOnError(async (argv) => {
        let near = await require('../utils/connect')(argv);

        if (argv.usingLedger) {
            if (argv.accountId) {
                console.log('WARN: Account id is provided but ignored in case of using Ledger.');
            }
            console.log(`Please, confirm on the Ledger receiving the public key for HD path ${argv.useLedgerKey}`);
            const publicKey = await argv.signer.getPublicKey({ enableCaching: false });
            if (!publicKey) {
                return;
            }
            if (!argv.yolo) {
                console.log('Please, confirm that this key is the one that is displayed on the Ledger screen now');
                if (!await argv.signer.getPublicKey({ enableCaching: false })) {
                    return;
                }
            }
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

        // If key doesn't exist, create one and store in the keyStore.
        // Otherwise, it's expected that both key and accountId are already provided in arguments.
        if (!argv.publicKey) {
            const keyPair = KeyPair.fromRandom('ed25519');
            argv.publicKey = keyPair.publicKey.toString();
            argv.accountId = argv.accountId || implicitAccountId(argv.publicKey);
            await keyStore.setKey(argv.networkId, argv.accountId, keyPair);
        } else if (argv.seedPhrase) {
            const seededKeyPair = await argv.signer.keyStore.getKey(argv.networkId, argv.accountId);
            await keyStore.setKey(argv.networkId, argv.accountId, seededKeyPair);
        }

        console.log(`Key pair with ${argv.publicKey} public key for an account "${argv.accountId}"`);
    })
};
