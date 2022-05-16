const { DEFAULT_FUNCTION_CALL_GAS, providers, utils } = require('near-api-js');
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const checkCredentials = require('../utils/check-credentials');

module.exports = {
    command: 'js <command> <command-options>',
    desc: 'Add an access key to given account',
    builder: (yargs) => yargs
        .command({
            command: 'deploy [jsFile] [initFunction] [initArgs] [initGas] [initDeposit] [initialBalance] [force]',
            desc: 'Deploy our smart contract to the network',
            builder: (yargs) => yargs
                .option('base64File', {
                    desc: 'Path to base64 encoded contract file to deploy',
                    type: 'string',
                    // required: true,
                })
                .option('gas', {
                    desc: 'Gas for deployment call',
                    type: 'number',
                    default: DEFAULT_FUNCTION_CALL_GAS,
                })
                .option('deposit', {
                    desc: 'Deposit to maintain the contract storage on the enclave',
                    type: 'string',
                })
                .option('depositYocto', {
                    desc: 'Deposit (in Yocto Near) to maintain the contract storage on the enclave',
                    type: 'string',
                })
                .option('initFunction', {
                    desc: 'Initialization method',
                    type: 'string',
                })
                .option('jsvm', {
                    desc: 'JSVM enclave contract id',
                    type: 'string',
                    default: null,
                })
                ,
            handler: exitOnError(deploy),
        })
        .command({
            command: 'call [accountId] [contractId] [methodName] [args] [gas] [deposit]',
            desc: 'Call a method on a contract',
            builder: (yargs) => yargs
                .option('accountId', {

                })
                ,
            // handler: exitOnError(deploy),
        })
        ,
};

function jsvm_contract_id(options) {
    if (options.jsvm !== null) {
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

async function deploy(options) {
    const { base64File } = options;
    const near = await connect(options);
    const accountId = await createDevAccountIfNeeded({ ...options, near });
    const account = await near.account(accountId);
    const jsvmId = jsvm_contract_id(options);
    const deposit = options.depositYocto != null ? options.depositYocto : utils.format.parseNearAmount(options.deposit);
    const base64Contract = readFileSync(base64File);

    console.log(
        `Starting deployment. Account id: ${accountId}, JSVM: ${jsvmId}, file: ${base64file}`);

    try {
        const functionCallResponse = await account.functionCall({
            contractId: jsvmId,
            methodName: 'deploy_js_contract',
            args: base64Contract,
            gas: options.gas.toNumber(),
            attachedDeposit: deposit,
        });
        const result = providers.getTransactionLastResult(functionCallResponse);

        inspectResponse.prettyPrintResponse(functionCallResponse, options);
        console.log(inspectResponse.formatResponse(result));
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
