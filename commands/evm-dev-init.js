const exitOnError = require('../utils/exit-on-error');
const { utils } = require('near-web3-provider');
const connect = require('../utils/connect');

module.exports = {
    command: 'evm-dev-init <accountId> [numAccounts]',
    desc: 'Creates test accounts using NEAR Web3 Provider',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'NEAR account creating the test subaccounts',
            type: 'string',
            default: '0'
        })
        .option('numAccounts', {
            desc: 'Number of test accounts to create',
            type: 'number',
            default: '5'
        }),
    handler: exitOnError(scheduleEVMDevInit)
};

async function scheduleEVMDevInit(options) {
    const near = await connect(options);
    const account = await near.account(options.accountId);
    await utils.createTestAccounts(account, options.numAccounts);
}
