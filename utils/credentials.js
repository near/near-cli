const chalk = require('chalk');

async function assertCredentials(accountId, networkId, keyStore, usingLedger) {
    if (usingLedger) return;

    const key = await keyStore.getKey(networkId, accountId);
    if (key) return;

    console.error(chalk`You are trying to use the account {bold.white ${accountId}}, but do not have the credentials locally (network: {bold.white ${networkId}})`);
    process.exit(1);
}

async function storeCredentials(accountId, networkId, keyStore, keyPair, force) {
    const key = await keyStore.getKey(networkId, accountId);

    if (key && !force) {
        console.log(chalk`The account {bold.white ${accountId}} already has local credentials (network: {bold.white ${networkId}})`);
        return;
    }

    console.log(chalk`Storing credentials for account: {bold.white ${accountId}} (network: {bold.white ${networkId}})`);
    console.log(`Saving key to '~/.near-credentials/${networkId}/${accountId}.json'`);
    await keyStore.setKey(networkId, accountId, keyPair);
}

module.exports = { assertCredentials, storeCredentials };