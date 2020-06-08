const KeyPair = require('near-api-js').KeyPair;
const exitOnError = require('../utils/exit-on-error');
const eventtracking = require('../utils/eventtracking');

module.exports = {
    command: 'generate-key <account-id>',
    desc: 'generate key ',
    builder: (yargs) => yargs,
    handler: exitOnError(async (argv) => {
        try {
            await eventtracking.track(eventtracking.EVENT_ID_GENERATE_KEY_START, { network: argv.networkId });
            let near = await require('../utils/connect')(argv);
            if (!argv.accountId) {
                return;
            }

            if (argv.usingLedger) {
                await argv.signer.getPublicKey();
                // NOTE: Command above already prints public key
                return;
            }

            const { deps: { keyStore } } = near.config;
            const existingKey = await keyStore.getKey(argv.networkId, argv.accountId);
            if (existingKey) {
                console.log(`Account has existing key pair with ${existingKey.publicKey} public key`);
                return;
            }

            const keyPair = KeyPair.fromRandom('ed25519');
            await keyStore.setKey(argv.networkId, argv.accountId, keyPair);
            console.log(`Generated key pair with ${keyPair.publicKey} public key`);
        } finally {
            await eventtracking.track(eventtracking.EVENT_ID_GENERATE_KEY_END, { network: argv.networkId, success: true });
        }
    })
};