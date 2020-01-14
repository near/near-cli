const { KeyPair } = require('nearlib');
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { readFile, writeFile } = require('fs').promises;

module.exports = {
    command: 'dev-deploy <wasmFile>',
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
    const { nodeUrl, helperUrl, masterAccount, wasmFile } = options;

    if (!helperUrl && !masterAccount) {
        throw new Error('Cannot create account as netiher helperUrl nor masterAccount is specified in config for current NODE_ENV (see src/config.js)');
    }

    const near = await connect(options);
    const accountId = await createDevAccountIfNeeded({ ...options, near });
    console.log(
        `Starting deployment. Account id: ${accountId}, node: ${nodeUrl}, helper: ${helperUrl}, file: ${wasmFile}`);
    const contractData = [await readFile(wasmFile)];
    const account = await near.account(accountId);
    await account.deployContract(contractData);
    console.log(`Done deploying to ${accountId}`);
}

async function createDevAccountIfNeeded({ near, keyStore, networkId, init }) {
    const accountFilePath = `${keyStore.keyDir}/dev-account`;
    if (!init) {
        try {
            const existingAccountId = (await readFile(accountFilePath)).toString('utf8').trim();
            if (existingAccountId && await keyStore.getKey(networkId, existingAccountId)) {
                return existingAccountId;
            }
        } catch (e) {
            if (e.code === 'ENOENT') {
                // Ignore as it means new account needs to be created
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
    return accountId;
}
