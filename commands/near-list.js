const exitOnError = require('../utils/exit-on-error');
const chalk = require('chalk');

module.exports = {
    command: 'list',
    desc: 'list accounts & keys stored in local',
    builder: (yargs) => yargs
        .option('networkId', {
            desc: 'NEAR network ID, allows using different keys based on network',
            type: 'string',
            required: false,
        }),
    handler: exitOnError(listKey)
};

async function listKey(options) {
    const accountsId = await options.keyStore.getAccounts(options.networkId)
    accountsId.forEach(async function(accountId) {
        keyPair = await options.keyStore.getKey(options.networkId, accountId);
        publicKey= keyPair.getPublicKey();
        console.log(chalk`Account ID: {yellow ${accountId}}, Public Key: {green ${publicKey}}, Private Key: {red ${keyPair}}`);
    });
}