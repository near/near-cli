const { KeyPair } = require('near-api-js');
const { readFile, writeFile, mkdir } = require('fs').promises;
const { existsSync } = require('fs');
const { PROJECT_KEY_DIR } = require('../middleware/key-store');


module.exports = async function createDevAccountIfNeeded({ near, keyStore, networkId, init, projectKeyDirectory, masterAccount }) {
    // TODO: once examples and create-near-app use the dev-account.env file, we can remove the creation of dev-account
    // https://github.com/near/near-cli/issues/287
    const accountFilePath = `${projectKeyDirectory}/dev-account`;
    const accountFilePathEnv = `${projectKeyDirectory}/dev-account.env`;
    if (!init) {
        try {
            // throws if either file is missing
            const existingAccountId = (await readFile(accountFilePath)).toString('utf8').trim();
            await readFile(accountFilePathEnv);

            if (existingAccountId && await keyStore.getKey(networkId, existingAccountId)) {
                return existingAccountId;
            }
        } catch (e) {
            if (e.code === 'ENOENT') {
                // Create neardev directory, new account will be created below
                if (!existsSync(PROJECT_KEY_DIR)) {
                    await mkdir(PROJECT_KEY_DIR);
                }
            } else {
                throw e;
            }
        }
    }

    let accountId;
    // create random number with at least 14 digits
    const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);

    if (masterAccount) {
        accountId = `dev-${Date.now()}.${masterAccount}`;
    } else {
        accountId = `dev-${Date.now()}-${randomNumber}`;
    }

    const keyPair = await KeyPair.fromRandom('ed25519');
    await near.accountCreator.createAccount(accountId, keyPair.publicKey);
    await keyStore.setKey(networkId, accountId, keyPair);
    await writeFile(accountFilePath, accountId);
    // write file to be used by env-cmd
    await writeFile(accountFilePathEnv, `CONTRACT_NAME=${accountId}`);
    return accountId;
};
