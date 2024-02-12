const { DEFAULT_NETWORK } = require('../../config');
const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');
const { utils } = require('near-api-js');

module.exports = {
    command: 'state <accountId>',
    desc: 'View account\'s state (balance, storage_usage, code_hash, etc...)',
    builder: (yargs) => yargs
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        }),
    handler: viewAccount
};

async function viewAccount(options) {
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let state = await account.state();
    if (state && state.amount) {
        state['formattedAmount'] = utils.format.formatNearAmount(state.amount);
    }
    console.log(`Account ${options.accountId}`);
    console.log(inspectResponse.formatResponse(state));
}