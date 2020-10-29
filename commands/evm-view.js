const exitOnError = require('../utils/exit-on-error');
const web3 = require('web3');
const { NearProvider, utils } = require('near-web3-provider');
const assert = require('assert');

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
    handler: exitOnError(scheduleEVMFunctionView)
};

async function scheduleEVMFunctionView(options) {
    const web = new web3();
    web.setProvider(new NearProvider({
        nodeUrl: options.nodeUrl,
        // TODO: make sure near-api-js has the same version between near-web3-provider.
        // keyStore: options.keyStore,
        masterAccountId: options.accountId,
        networkId: options.networkId,
        evmAccountId: options.evmAccount,
    }));
    const contract = new web.eth.Contract(options.abi, options.contractName);
    const args = JSON.parse(options.args || '[]');
    assert(options.methodName in contract.methods, `${options.methodName} is not present in ABI`);
    const result = await contract.methods[options.methodName](...args).call({ from: utils.nearAccountToEvmAddress(options.accountId) });
    console.log(result);
}
