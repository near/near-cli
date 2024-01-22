const { DEFAULT_NETWORK } = require('../../config');
const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');

module.exports = {
    command: 'list-keys <accountId>',
    aliases: ['keys'],
    desc: 'query public keys of account',
    builder: (yargs) => yargs
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet',
            type: 'string',
            default: DEFAULT_NETWORK
        }),
    handler: viewAccessKeys
};

async function viewAccessKeys(options) {
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let accessKeys = await account.getAccessKeys();
    console.log(`Keys for account ${options.accountId}`);
    console.log(inspectResponse.formatResponse(accessKeys));
}
