const nearlib = require('nearlib');
const { utils } = nearlib;
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');

module.exports = {
    command: 'call <contractName> <methodName> [args]',
    desc: 'schedule smart contract call which can modify state',
    builder: (yargs) => yargs
        .option('amount', {
            desc: 'Number of tokens to attach',
            type: 'string',
            default: '0.0000000001'
        }),
    handler: exitOnError(scheduleFunctionCall)
};

async function scheduleFunctionCall(options) {
    console.log(`Scheduling a call: ${options.contractName}.${options.methodName}(${options.args || ''})` +
        (options.amount ? ` with attached ${utils.format.parseNearAmount(options.amount)} NEAR` : ''));
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const functionCallResponse = await account.functionCall(
        options.contractName,
        options.methodName,
        JSON.parse(options.args || '{}'),
        utils.format.parseNearAmount(options.amount));
    const result = nearlib.providers.getTransactionLastResult(functionCallResponse);
    console.log(inspectResponse(result));
};
