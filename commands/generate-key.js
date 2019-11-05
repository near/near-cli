const KeyPair = require('nearlib').KeyPair;
const exitOnError = require('../utils/exit-on-error');

module.exports = {
    command: 'generate-key <account-id>',
    desc: 'generate key ',
    builder: (yargs) => yargs,
    handler: exitOnError(async (argv) => {
        let near = await require('../utils/connect')(argv);
        if (argv.accountId) {
            const { deps: { keyStore }} = near.config;
            const existingKey = await keyStore.getKey(argv.networkId, argv.accountId);
            if (existingKey) {
                console.log(`Account has existing key pair with ${existingKey.publicKey} public key`)
            } else {
                const keyPair = KeyPair.fromRandom('ed25519');
                await keyStore.setKey(argv.networkId, argv.accountId, keyPair);
                console.log(`Generated key pair with ${keyPair.publicKey} public key`);
            }
        }
    })
};