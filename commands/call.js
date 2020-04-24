const nearlib = require('near-api-js');
const { utils } = nearlib;
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const eventtracking = require('../utils/eventtracking');

module.exports = {
    command: 'call <contractName> <methodName> [args]',
    desc: 'schedule smart contract call which can modify state',
    builder: (yargs) => yargs
        .option('gas', {
            desc: 'Max amount of gas this call can use',
            type: 'string',
            default: '100000000000000'
        })
        .option('amount', {
            desc: 'Number of tokens to attach',
            type: 'string',
            default: '0'
        }),
    handler: exitOnError(scheduleFunctionCall)
};

async function scheduleFunctionCall(options) {
    await eventtracking.track(eventtracking.EVENT_ID_SCHEDULE_FN_CALL_START, { node: options.nodeUrl });
    console.log(`Scheduling a call: ${options.contractName}.${options.methodName}(${options.args || ''})` +
        (options.amount && options.amount != '0' ? ` with attached ${options.amount} NEAR` : ''));
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const functionCallResponse = await account.functionCall(
        options.contractName,
        options.methodName,
        JSON.parse(options.args || '{}'),
        options.gas,
        utils.format.parseNearAmount(options.amount));
    const result = nearlib.providers.getTransactionLastResult(functionCallResponse);
    console.log(inspectResponse(result));
    await eventtracking.track(eventtracking.EVENT_ID_SCHEDULE_FN_CALL_END, { node: options.nodeUrl, success: true });
}
