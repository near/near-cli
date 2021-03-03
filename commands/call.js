const { providers, utils } = require('near-api-js');
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');

module.exports = {
    command: 'call <contractName> <methodName> [args]',
    desc: 'schedule smart contract call which can modify state',
    builder: (yargs) => yargs
        .option('gas', {
            desc: 'Max amount of gas this call can use (in gas units)',
            type: 'string',
            default: '100000000000000'
        })
        .option('amount', {
            desc: 'Number of tokens to attach (in NEAR)',
            type: 'string',
            default: '0'
        })
        .option('base64',  {
            desc: 'Treat arguments as base64-encoded BLOB.',
            type: 'boolean',
            default: false
        })
        .option('args', {
            desc: 'Arguments to the contract call, in JSON format by default (e.g. \'{"param_a": "value"}\')',
            type: 'string',
            default: null
        })
        .option('accountId', {
            required: true,
            desc: 'Unique identifier for the account that will be used to sign this call',
            type: 'string',
        }),
    handler: exitOnError(scheduleFunctionCall)
};

async function scheduleFunctionCall(options) {
    console.log(`Scheduling a call: ${options.contractName}.${options.methodName}(${options.args || ''})` +
        (options.amount && options.amount != '0' ? ` with attached ${options.amount} NEAR` : ''));
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const parsedArgs = options.base64 ? Buffer.from(options.args, 'base64') : JSON.parse(options.args || '{}');
    const functionCallResponse = await account.functionCall(
        options.contractName,
        options.methodName,
        parsedArgs,
        options.gas,
        utils.format.parseNearAmount(options.amount));
    const result = providers.getTransactionLastResult(functionCallResponse);
    inspectResponse.prettyPrintResponse(functionCallResponse, options);
    console.log(inspectResponse.formatResponse(result));
}
