const KeyPair = require('near-api-js').KeyPair;
const exitOnError = require('../utils/exit-on-error');
const eventtracking = require('../utils/eventtracking');

module.exports = {
    command: 'generate-key <account-id>',
    desc: 'generate key ',
    builder: (yargs) => yargs,
    handler: exitOnError(async (argv) => {
        await eventtracking.track(eventtracking.EVENT_ID_GENERATE_KEY_START, { network: argv.networkId });
        let near = await require('../utils/connect')(argv);
        if (argv.accountId) {
            const { deps: { keyStore } } = near.config;
            const existingKey = await keyStore.getKey(argv.networkId, argv.accountId);
            if (existingKey) {
                console.log(`Account has existing key pair with ${existingKey.publicKey} public key`);
            } else {
                const keyPair = KeyPair.fromRandom('ed25519');
                await keyStore.setKey(argv.networkId, argv.accountId, keyPair);
                console.log(`Generated key pair with ${keyPair.publicKey} public key`);
            }
        }
        await eventtracking.track(eventtracking.EVENT_ID_GENERATE_KEY_END, { network: argv.networkId, success: true });
    })
};