const { KeyPair } = require('near-api-js');
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { readFile, writeFile } = require('fs').promises;
const eventtracking = require('../utils/eventtracking');

module.exports = {
    command: 'dev-deploy [wasmFile]',
    desc: 'deploy your smart contract using temporary account (TestNet only)',
    builder: (yargs) => yargs
        .option('wasmFile',{
            desc: 'Path to wasm file to deploy',
            type: 'string',
            default: './out/main.wasm'
        })
        .option('init', {
            desc: 'Create new account for deploy (even if there is one already available)',
            type: 'boolean',
            default: false
        })
        .alias({
            'init': ['force', 'f'],
        }),
    handler: exitOnError(devDeploy)
};

async function devDeploy(options) {
    await eventtracking.track(eventtracking.EVENT_ID_DEV_DEPLOY_START, { node: options.nodeUrl });
    try {
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
    } catch (e) {
        await eventtracking.track(eventtracking.EVENT_ID_DEV_DEPLOY_END, { node: options.nodeUrl, success: false });
    }
}

async function createDevAccountIfNeeded({ near, keyStore, networkId, init }) {
    // TODO: once examples and create-near-app use the dev-account.env file, we can remove the creation of dev-account
    // https://github.com/nearprotocol/near-shell/issues/287
    const accountFilePath = `${keyStore.keyDir}/dev-account`;
    const accountFilePathEnv = `${keyStore.keyDir}/dev-account.env`;
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
                // Ignore as it means new account needs to be created, which happens below
            } else {
                throw e;
            }
        }
    }

    const accountId = `dev-${Date.now()}`;
    const keyPair = await KeyPair.fromRandom('ed25519');
    await near.accountCreator.createAccount(accountId, keyPair.publicKey);
    await keyStore.setKey(networkId, accountId, keyPair);
    await writeFile(accountFilePath, accountId);
    // write file to be used by env-cmd
    await writeFile(accountFilePathEnv, `CONTRACT_NAME=${accountId}`);
    return accountId;
}
