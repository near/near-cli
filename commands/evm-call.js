const exitOnError = require('../utils/exit-on-error');
const web3 = require('web3');
const { NearProvider, utils } = require('near-web3-provider');
const assert = require('assert');

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
    handler: exitOnError(scheduleEVMFunctionCall)
};

async function scheduleEVMFunctionCall(options) {
    const args = JSON.parse(options.args || '[]');
    console.log(`Scheduling a call inside ${options.evmAccount} EVM:`);
    console.log(`${options.contractName}.${options.methodName}()` +
        (options.amount && options.amount !== '0' ? ` with attached ${options.amount} NEAR` : ''));
    console.log('  with args', args);
    const web = new web3();
    web.setProvider(new NearProvider({
        nodeUrl: options.nodeUrl,
        // TODO: make sure near-api-js has the same version between near-web3-provider.
        // keyStore: options.keyStore,
        masterAccountId: options.accountId,
        networkId: options.networkId,
        evmAccountId: options.evmAccount,
        keyPath: options.keyPath,
    }));
    const contract = new web.eth.Contract(options.abi, options.contractName);
    assert(options.methodName in contract.methods, `${options.methodName} is not present in ABI`);
    await contract.methods[options.methodName](...args).send({ from: utils.nearAccountToEvmAddress(options.accountId) });
}
