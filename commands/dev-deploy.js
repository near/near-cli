const { KeyPair } = require('near-api-js');
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { readFile, writeFile, mkdir } = require('fs').promises;
const { existsSync } = require('fs');
const eventtracking = require('../utils/eventtracking');
const { PROJECT_KEY_DIR } = require('../middleware/key-store');

module.exports = {
    command: 'dev-deploy [wasmFile]',
    desc: 'deploy your smart contract using temporary account (TestNet only)',
    builder: (yargs) => yargs
        .option('wasmFile', {
            desc: 'Path to wasm file to deploy',
            type: 'string',
            default: './out/main.wasm'
        })
        .option('init', {
            desc: 'Create new account for deploy (even if there is one already available)',
            type: 'boolean',
            default: false
        })
        .option('initialBalance', {
            desc: 'Number of tokens to transfer to newly created account',
            type: 'string',
            default: '100'
        })
        .alias({
            'init': ['force', 'f'],
        }),
    handler: exitOnError(devDeploy)
};

async function devDeploy(options) {
    await eventtracking.askForConsentIfNeeded();
    await eventtracking.track(eventtracking.EVENT_ID_DEV_DEPLOY_START, { node: options.nodeUrl });
    const { nodeUrl, helperUrl, masterAccount, wasmFile } = options;

    if (!helperUrl && !masterAccount) {
        throw new Error('Cannot create account as neither helperUrl nor masterAccount is specified in config for current NODE_ENV (see src/config.js)');
    }

    const near = await connect(options);
    const accountId = await createDevAccountIfNeeded({ ...options, near });
    console.log(
        `Starting deployment. Account id: ${accountId}, node: ${nodeUrl}, helper: ${helperUrl}, file: ${wasmFile}`);
    const contractData = await readFile(wasmFile);
    const account = await near.account(accountId);
    await account.deployContract(contractData);
    console.log(`Done deploying to ${accountId}`);
    await eventtracking.track(eventtracking.EVENT_ID_DEV_DEPLOY_END, { node: options.nodeUrl, success: true });
}

async function createDevAccountIfNeeded({ near, keyStore, networkId, init, masterAccount, helperUrl, tla }) {
    // TODO: once examples and create-near-app use the dev-account.env file, we can remove the creation of dev-account
    // https://github.com/nearprotocol/near-shell/issues/287
    const accountFilePath = `${PROJECT_KEY_DIR}/dev-account`;
    const accountFilePathEnv = `${PROJECT_KEY_DIR}/dev-account.env`;
    if (!init) {
        try {
            // throws if either file is missing
            const existingAccountId = (await readFile(accountFilePath)).toString('utf8').trim();
            await readFile(accountFilePathEnv);
            if (existingAccountId && await keyStore.getKey(networkId, existingAccountId)) {
                return existingAccountId;
            }
        } catch (e) {
            if (e.code === 'ENOENT') {
                // Create neardev directory, new account will be created below
                if (!existsSync(PROJECT_KEY_DIR)) {
                    await mkdir(PROJECT_KEY_DIR);
                }
            } else {
                throw e;
            }
        }
    }
    let accountId;
    if (typeof masterAccount === 'undefined' && helperUrl && tla) {
        accountId = `dev-${Date.now()}.${tla}`;
    } else if (masterAccount) {
        accountId = `dev-${Date.now()}.${masterAccount}`;
    } else {
        console.error('Expecting helperUrl and/or tla flag, please provide those.');
    }

    const keyPair = await KeyPair.fromRandom('ed25519');
    await near.accountCreator.createAccount(accountId, keyPair.publicKey);
    await keyStore.setKey(networkId, accountId, keyPair);
    await writeFile(accountFilePath, accountId);
    // write file to be used by env-cmd
    await writeFile(accountFilePathEnv, `CONTRACT_NAME=${accountId}`);
    return accountId;
}
