const exitOnError = require('../utils/exit-on-error');
const chalk = require('chalk');
const connect = require('../utils/connect');

module.exports = {
    command: 'list [networkId] [check]',
    desc: 'list accounts & keys stored in local',
    builder: (yargs) => yargs
        .option('networkId', {
            desc: 'NEAR network ID, allows using different keys based on network',
            type: 'string',
            required: false,
        })
        .option('check', {
            desc: 'shows only valid keys',
            type: 'boolean',
            default: false,
        }),
    handler: exitOnError(listKey)
};

async function listKey(options) {
    if (options.check) {
        const accountsId = await options.keyStore.getAccounts(options.networkId);
        const near = await connect(options);
        accountsId.forEach(async function(accountId) {
            let account = await near.account(accountId);
            let accessKeys = await account.getAccessKeys();
            accessKeys.forEach(async function(accessKey){
                keyPair = await options.keyStore.getKey(options.networkId, accountId);
                publicKey= keyPair.getPublicKey();
                if (accessKey.public_key==publicKey) {
                    console.log(chalk`Account ID: {yellow ${accountId}}, Public Key: {green ${publicKey}}, Private Key: {red ${keyPair}}`);
                    return false;
                }
            });
        });
    } else {
        const accountsId = await options.keyStore.getAccounts(options.networkId);
        accountsId.forEach(async function(accountId) {
            keyPair = await options.keyStore.getKey(options.networkId, accountId);
            publicKey= keyPair.getPublicKey();
            console.log(chalk`Account ID: {yellow ${accountId}}, Public Key: {green ${publicKey}}, Private Key: {red ${keyPair}}`);
        });
    }
}