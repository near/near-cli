const { evmDeprecated } = require('../utils/deprecation-warning');

module.exports = {
    command: 'evm-view <evmAccount> <contractName> <methodName> [args]',
    desc: 'View call inside EVM machine',
    builder: (yargs) => yargs
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
            desc: 'Path to ABI for given contract',
            type: 'string',
        }),
    handler: () => console.log(evmDeprecated)
};
