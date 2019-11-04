const yargs = require('yargs');
const main = require('../');
const exitOnError = require('../utils/exit-on-error')

// For account: 
const createAccount = {
    command: 'create_account <accountId>',
    desc: 'create a developer account',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'Unique identifier for the newly created account',
            type: 'string',
            required: true
        })
        .option('masterAccount', {
            desc: 'Account used to create requested account.',
            type: 'string',
            required: true
        })
        .option('publicKey', {
            desc: 'Public key to initialize the account with',
            type: 'string',
            required: false
        })
        .option('initialBalance', {
            desc: 'Number of tokens to transfer to newly created account',
            type: 'string',
            default: '1000000000000000000'
        }),
    handler: exitOnError(main.createAccount)
};

const login = {
    command: 'login',
    desc: 'create a developer account',
    builder: (yargs) => yargs,
    handler: exitOnError(main.login)
};

const viewAccount = {
    command: 'view <accountId>',
    desc: 'view account',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'Account to view',
            type: 'string',
            required: true
        }),
    handler: exitOnError(main.viewAccount)
};

const deleteAccount = {
    command: 'delete <accountId> <beneficiaryId>',
    desc: 'delete an account and transfer funds to beneficiary account.',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'Account to view',
            type: 'string',
            required: true
        })
        .option('beneficiaryId', {
            desc: 'Account to transfer funds to',
            type: 'string',
            required: true
        }),
    handler: exitOnError(main.deleteAccount)
};

const keys = {
    command: 'keys <accountId>',
    desc: 'view account public keys',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'Account to view',
            type: 'string',
            required: true
        }),
    handler: exitOnError(main.keys)
};

const sendMoney = {
    command: 'send <sender> <receiver> <amount>',
    desc: 'send tokens to given receiver',
    builder: (yargs) => yargs,
    handler: exitOnError(main.sendMoney)
};

const stake = {
    command: 'stake [accountId] [stakingKey] [amount]',
    desc: 'create staking transaction',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'Account to stake on',
            type: 'string',
            required: true,
        })
        .option('stakingKey', {
            descr: 'Public key to stake with (base58 encoded)',
            type: 'string',
            required: true,
        })
        .option('amount', {
            descr: 'Amount to stake',
            type: 'string',
            required: true,
        }),
    handler: exitOnError(main.stake)
};

// For contract:
const deploy = {
    command: 'deploy',
    desc: 'deploy your smart contract',
    builder: (yargs) => yargs
        .option('wasmFile', {
            desc: 'Path to wasm file to deploy',
            type: 'string',
            default: './out/main.wasm'
        })
        .alias({
            'accountId': ['account_id', 'contractName', 'contract_name'],
        }),
    handler: exitOnError(main.deploy)
};

const scheduleFunctionCall = {
    command: 'call <contractName> <methodName> [args]',
    desc: 'schedule smart contract call which can modify state',
    builder: (yargs) => yargs
        .option('amount', {
            desc: 'Number of tokens to attach',
            type: 'string',
            default: '1000000000'
        }),
    handler: exitOnError(main.scheduleFunctionCall)
};

const callViewFunction = {
    command: 'view <contractName> <methodName> [args]',
    desc: 'make smart contract call which can view state',
    builder: (yargs) => yargs,
    handler: exitOnError(main.callViewFunction)
};

const { spawn } = require('child_process');
const build = {
    command: 'build',
    desc: 'build your smart contract',
    handler: () => {
        const gulp = spawn('gulp');
        gulp.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        gulp.stderr.on('data', function (data) {
            console.log(data.toString());
        });
        gulp.on('exit', function (code) {
            process.exit(code);
        });
    }
};

// For transaction:
const txStatus = {
    command: 'tx-status <hash>',
    desc: 'lookup transaction status by hash',
    builder: (yargs) => yargs
        .option('hash', {
            desc: 'base58-encoded hash',
            type: 'string',
            required: true
        }),
    handler: exitOnError(main.txStatus)
};

const clean = {
    command: 'clean',
    desc: 'clean the build environment',
    builder: (yargs) => yargs
        .option('outDir', {
            desc: 'build directory',
            type: 'string',
            default: './out'
        }),
    handler: exitOnError(main.clean)
};

let config = require('../get-config')();
yargs // eslint-disable-line
    .scriptName('near')
    .option('nodeUrl', {
        desc: 'NEAR node URL',
        type: 'string',
        default: 'http://localhost:3030'
    })
    .option('networkId', {
        desc: 'NEAR network ID, allows using different keys based on network',
        type: 'string',
        default: 'default'
    })
    .option('helperUrl', {
        desc: 'NEAR contract helper URL',
        type: 'string',
    })
    .option('keyPath', {
        desc: 'Path to master account key',
        type: 'string',
    })
    .option('homeDir', {
        desc: 'Where to look for master account, default is ~/.near',
        type: 'string',
        default: `${process.env.HOME}/.near`,
    })
    .option('accountId', {
        desc: 'Unique identifier for the account',
        type: 'string',
    })
    .command(createAccount)
    .command(viewAccount)
    .command(deleteAccount)
    .command(keys)
    .command(txStatus)
    .command(build)
    .command(deploy)
    .command(scheduleFunctionCall)
    .command(callViewFunction)
    .command(viewAccount)
    .command(sendMoney)
    .command(clean)
    .command(stake)
    .command(login)
    .command(require('../commands/repl'))
    .command(require('../commands/generate-key'))
    .config(config)
    .alias({
        'accountId': ['account_id'],
        'nodeUrl': 'node_url',
        'networkId': ['network_id'],
        'wasmFile': 'wasm_file',
        'projectDir': 'project_dir',
        'outDir': 'out_dir'
    })
    .showHelpOnFail(true)
    .demandCommand(1, 'Please enter a command')
    .argv;

