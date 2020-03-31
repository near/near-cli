// npm imports
const chalk = require('chalk');

// NEAR imports
const { keyStores } = require('nearlib');
const UnencryptedFileSystemKeyStore = keyStores.UnencryptedFileSystemKeyStore;

// local imports
const connect = require('./connect');

module.exports = async (accountId, keyPair, options) => {
    try {
        // check that the key got added
        const near = await connect(options);
        let account = await near.account(accountId);
        let keys = await account.getAccessKeys();
        let publicKey = keyPair.getPublicKey().toString();
        const short = key => `${key.substring(0, 14)}...`; // keep the public key readable

        let keyFound = keys.some(
            key => key.public_key == keyPair.getPublicKey().toString()
        );
        if (keyFound) {
            const keyStore = new UnencryptedFileSystemKeyStore('./neardev');
            await keyStore.setKey(options.networkId, accountId, keyPair);
            console.log(chalk`Logged in as [ {bold ${accountId}} ] with public key [ {bold ${short(publicKey)}} ] successfully\n`
            );
        } else {
            console.log(chalk`The account you provided {bold.red [ {bold.white ${accountId}} ] has not authorized the expected key [ {bold.white ${short(publicKey)}} ]}  Please try again.\n`
            );
        }
    } catch (e) {
        if (/Account ID/.test(e.message)) {
            console.log(chalk`\n{bold.red You need to provide a valid account ID to login}. Please try logging in again.\n`);
        } else if (/does not exist/.test(e.message)) {
            console.log(chalk`\nThe account you provided {bold.red [ {bold.white ${accountId}} ] does not exist on the [ {bold.white ${options.networkId}} ] network} (using ${options.nodeUrl})\n`);
        } else {
            throw e;
        }
    }

    return;
};
