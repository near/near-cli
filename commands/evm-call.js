const { evmDeprecated } = require('../utils/deprecation-warning');

module.exports = {
    command: 'evm-call <evmAccount> <contractName> <methodName> [args]',
    desc: 'Schedule call inside EVM machine',
    builder: (yargs) => yargs
        .option('gas', {
            desc: 'Max amount of NEAR gas this call can use',
            type: 'string',
            default: '100000000000000'
        })
        .option('amount', {
            desc: 'Number of tokens to attach',
            type: 'string',
            default: '0'
        })
        .option('args', {
            desc: 'Arguments to the contract call, in JSON format (e.g. \'[1, "str"]\') based on contract ABI',
            type: 'string',
            default: null
        })
        .option('accountId', {
            required: true,
            desc: 'Unique identifier for the account that will be used to sign this call',
            type: 'string',
        })
        .option('abi', {
            required: true,
            desc: 'Path to ABI for given contract',
            type: 'string',
        }),
    handler: () => console.log(evmDeprecated)
};
