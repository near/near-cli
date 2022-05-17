const { DEFAULT_FUNCTION_CALL_GAS, providers, utils } = require('near-api-js');
const { readFileSync } = require('fs');
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const checkCredentials = require('../utils/check-credentials');


module.exports = {
    command: 'js <command> <command-options>',
    desc: 'Add an access key to given account',
    builder: (yargs) => yargs
        .command({
            command: 'deploy [base64File] [initFunction] [initArgs] [initGas] [initDeposit]',
            desc: 'Deploy our smart contract to the network',
            builder: (yargs) => yargs
                .option('base64File', {
                    desc: 'Path to base64 encoded contract file to deploy',
                    type: 'string',
                    required: true,
                })
                .option('gas', {
                    desc: 'Gas for deployment call',
                    type: 'number',
                    default: DEFAULT_FUNCTION_CALL_GAS,
                })
                .option('deposit', {
                    desc: 'Deposit to maintain the contract storage on the enclave',
                    type: 'string',
                    default: '0',
                })
                .option('depositYocto', {
                    desc: 'Deposit (in Yocto Near) to maintain the contract storage on the enclave',
                    type: 'string',
                    default: null,
                })
                .option('accountId', {
                    desc: 'Unique identifier for the account that will be used to sign this call',
                    type: 'string',
                    required: true,
                })
                .option('initFunction', {
                    desc: 'Initialization method',
                    type: 'string',
                })
                .option('jsvm', {
                    desc: 'JSVM enclave contract id',
                    type: 'string',
                    default: null,
                }),
            handler: exitOnError(deploy),
        })
        .command({
            command: 'remove [accountId]',
            desc: 'Remove a JSVM contract from the network',
            builder: (yargs) => yargs
                .option('accountId', {
                    desc: 'The id of the account that will be removed from the enclave',
                    type: 'string',
                    required: true,
                })
                .option('gas', {
                    desc: 'Gas used to remove the contract from the enclave',
                    type: 'number',
                    default: DEFAULT_FUNCTION_CALL_GAS,
                })
                .option('jsvm', {
                    desc: 'JSVM enclave contract id',
                    type: 'string',
                    default: null,
                }),
            handler: exitOnError(remove),
        })
        .command({
            command: 'call [contractId] [methodName] [args] [gas] [deposit]',
            desc: 'Call a method on a contract',
            builder: (yargs) => yargs
                .option('accountId', {
                    desc: 'Unique identifier for the account that will be used to sign this call',
                    type: 'string',
                    required: true,
                })
                .option('args', {
                    desc: 'Arguments to the contract call, in JSON format by default (e.g. \'{"param_a": "value"}\')',
                    type: 'string',
                    default: '',
                })
                .option('gas', {
                    desc: 'Gas used to make a call into the contract from the enclave',
                    type: 'number',
                    default: DEFAULT_FUNCTION_CALL_GAS,
                })
                .option('deposit', {
                    desc: 'Deposit to maintain the contract storage on the enclave',
                    type: 'string',
                    default: '0',
                })
                .option('depositYocto', {
                    desc: 'Deposit (in Yocto Near) to maintain the contract storage on the enclave',
                    type: 'string',
                    default: null,
                })
                .option('jsvm', {
                    desc: 'JSVM enclave contract id',
                    type: 'string',
                    default: null,
                }),
            handler: exitOnError(call),
        })
    ,
};

// Encode JSVM related arguments into base64 for use in the enclave
function base64_encode_args(contractId, functionName, args) {
    let buf = Buffer.concat([
        Buffer.from(contractId),
        Buffer.from([0]),
        Buffer.from(functionName),
        Buffer.from([0]),
        Buffer.from(args)]
    );
    return Buffer.from(buf.toString('base64'), 'base64');
}

function jsvm_contract_id(options) {
    if (options.jsvm !== null && options.jsvm !== undefined) {
        return options.jsvm;
    }

    if (options.networkId === 'mainnet') {
        throw Error('No current default jsvm contract for mainnet');
    }

    if (options.networkId === 'testnet') {
        return 'jsvm.testnet';
    }

    throw Error(`Cannot find a default JSVM contract for network id ${option.networkId}`);
}

async function jsvm_transact(options, {methodName, args, gas, deposit}) {
    const { accountId } = options;
    const near = await connect(options);
    const account = await near.account(accountId);
    const jsvmId = jsvm_contract_id(options);

    try {
        const functionCallResponse = await account.functionCall({
            contractId: jsvmId,
            methodName: methodName,
            args: args,
            gas: gas,
            attachedDeposit: deposit,
        });
        inspectResponse.prettyPrintResponse(functionCallResponse, options);

        return providers.getTransactionLastResult(functionCallResponse);
    } catch (error) {
        switch (JSON.stringify(error.kind)) {
            case '{"ExecutionError":"Exceeded the prepaid gas."}': {
                handleExceededThePrepaidGasError(error, options);
                break;
            }
            default: {
                console.log(error);
            }
        }
    }
}

async function deploy(options) {
    await checkCredentials(options.accountId, options.networkId, options.keyStore);

    const { accountId, base64File } = options;
    const jsvmId = jsvm_contract_id(options);
    const deposit = options.depositYocto != null ? options.depositYocto : utils.format.parseNearAmount(options.deposit);
    const base64Contract = Buffer.from(readFileSync(base64File), 'base64');

    console.log(
        `Starting deployment. Account id: ${accountId}, JSVM: ${jsvmId}, file: ${base64File}`);

    await jsvm_transact(options, {
        methodName: 'deploy_js_contract',
        args: base64Contract,
        gas: options.gas.toNumber(),
        deposit,
    });
}

async function remove(options) {
    await checkCredentials(options.accountId, options.networkId, options.keyStore);

    const { accountId } = options;
    const jsvmId = jsvm_contract_id(options);

    console.log(
        `Removing contract from enclave. Account id: ${accountId}, JSVM: ${jsvmId}`);

    await jsvm_transact(options, {
        methodName: 'remove_js_contract',
        args: JSON.parse('{}'),
        gas: options.gas.toNumber(),
        deposit: '0',
    });
}

async function call(options) {
    await checkCredentials(options.accountId, options.networkId, options.keyStore);

    const jsvmId = jsvm_contract_id(options);
    const deposit = options.depositYocto != null ? options.depositYocto : utils.format.parseNearAmount(options.deposit);
    const args = base64_encode_args(options.contractId, options.methodName, options.args);

    console.log(`Scheduling a call in JSVM[${jsvmId}]: ${options.contractId}.${options.methodName}(${options.args || ''})` +
        (deposit && deposit != '0' ? ` with attached ${utils.format.formatNearAmount(deposit)} NEAR` : ''));

    const result = await jsvm_transact(options, {
        methodName: 'call_js_contract',
        args,
        gas: options.gas.toNumber(),
        deposit,
    });

    console.log(inspectResponse.formatResponse(result));
}
