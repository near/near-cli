const { evmDeprecated } = require('../utils/deprecation-warning');

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
    handler: () => console.log(evmDeprecated)
};
