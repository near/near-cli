const nearjs = require('nearlib');
const { KeyPair, keyStores } = require('nearlib');
const UnencryptedFileSystemKeyStore = keyStores.UnencryptedFileSystemKeyStore;
const fs = require('fs');
const util = require('util')
const yargs = require('yargs');
const bs58 = require('bs58');
const ncp = require('ncp').ncp;
const rimraf = require('rimraf');
const readline = require('readline');
const URL = require('url').URL;

ncp.limit = 16;

const inspectResponse = (response) => {
    return util.inspect(response, { showHidden: false, depth: null, colors: true });
};

// TODO: Fix promisified wrappers to handle error properly

exports.newProject = async function(options) {
  // Need to wait for the copy to finish, otherwise next tasks do not find files.
  const projectDir = options.projectDir;
  const sourceDir = __dirname + "/blank_project";
  console.log(`Copying files to new project directory (${projectDir}) from template source (${sourceDir}).`);
  const copyDirFn = () => {
      return new Promise(resolve => {
          ncp (sourceDir, options.projectDir, response => resolve(response));
  })};
  await copyDirFn();
  console.log('Copying project files complete.')
};

exports.clean = async function() {
  const rmDirFn = () => {
      return new Promise(resolve => {
      rimraf(yargs.argv.outDir, response => resolve(response));
  })};
  await rmDirFn();
  console.log("Clean complete.");
};

async function connect(options) {
    const keyStore = new UnencryptedFileSystemKeyStore('./neardev');
    options.deps = {
        keyStore,
    };
    // TODO: search for key store.
    return await nearjs.connect(options);
}

exports.createAccount = async function(options) {
    let near = await connect(options);
    let keyPair;
    let publicKey;
    if (options.publicKey) {
        publicKey = options.publicKey;
    } else {
        keyPair = await KeyPair.fromRandom('ed25519');
        publicKey = keyPair.getPublicKey();
    }
    await near.createAccount(options.accountId, publicKey);
    if (keyPair) {
        await near.connection.signer.keyStore.setKey(options.networkId, options.accountId, keyPair);
    }
    console.log(`Account ${options.accountId} for network "${options.networkId}" was created.`);
}

exports.viewAccount = async function(options) {
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let state = await account.state();
    console.log(`Account ${options.accountId}`);
    console.log(state);
}

exports.deleteAccount = async function(options) {
    console.log(
        `Deleting account. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, beneficiary: ${options.beneficiaryId}`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    await account.deleteAccount(options.beneficiaryId);
    console.log(`Account ${options.accountId} for network "${options.networkId}" was deleted.`);
};

exports.keys = async function(options) {
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let accessKeys = await account.getAccessKeys();
    console.log(`Keys for account ${options.accountId}`);
    console.log(inspectResponse(accessKeys));
}

exports.txStatus = async function(options) {
    let near = await connect(options);
    let status = await near.connection.provider.txStatus(bs58.decode(options.hash));
    console.log(`Transaction ${options.hash}`);
    console.log(status);
}

exports.deploy = async function(options) {
    console.log(
        `Starting deployment. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, file: ${options.wasmFile}`);
    const near = await connect(options);
    const contractData = [...fs.readFileSync(options.wasmFile)];
    const account = await near.account(options.accountId);
    await account.deployContract(contractData);
};

exports.scheduleFunctionCall = async function(options) {
    console.log(`Scheduling a call: ${options.contractName}.${options.methodName}(${options.args || ''})` +
        (options.amount ? ` with attached ${options.amount} NEAR` : ''));
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const functionCallResponse = await account.functionCall(options.contractName, options.methodName, JSON.parse(options.args || '{}'), options.amount);
    const result = nearjs.providers.getTransactionLastResult(functionCallResponse);
    console.log('Result:', result);
};

exports.sendMoney = async function(options) {
    console.log(`Sending ${options.amount} NEAR to ${options.receiver} from ${options.sender}`);
    const near = await connect(options);
    const account = await near.account(options.sender);
    await account.sendMoney(options.receiver, options.amount);
};

exports.callViewFunction = async function(options) {
    console.log(`View call: ${options.contractName}.${options.methodName}(${options.args || ''})`);
    const near = await connect(options);
    // TODO: Figure out how to run readonly calls without account
    const account = await near.account(options.accountId || options.masterAccount || 'register.near');
    console.log('Result:', await account.viewFunction(options.contractName, options.methodName, JSON.parse(options.args || '{}')));
};

exports.stake = async function(options) {
    console.log(`Staking ${options.amount} on ${options.accountId} with public key = ${options.publicKey}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const result = await account.stake(options.publicKey, BigInt(options.amount));
    console.log('Result: ', JSON.stringify(result));
}

exports.login = async function(options) {
    if (!options.walletUrl) {
        console.log("Log in is not needed on this environment. Please use appropriate master account for shell operations.")
    } else {
        const newUrl = new URL(options.walletUrl + "/login/");
        const title = 'NEAR Shell';
        newUrl.searchParams.set('title', title);
        const keyPair = await KeyPair.fromRandom('ed25519');
        newUrl.searchParams.set('public_key', keyPair.getPublicKey());
        console.log(`Please navigate to this url and follow the instructions to log in: \n${newUrl.toString()}`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Please enter the accountId that you logged in with:', async (accountId) => {
            try {
                // check that the key got added
                const near = await connect(options);
                let account = await near.account(accountId);
                let keys = await account.getAccessKeys();
                let keyFound = keys.some(key => key.public_key == keyPair.getPublicKey().toString());
                if (keyFound) {
                    const keyStore = new UnencryptedFileSystemKeyStore('./neardev');
                    keyStore.setKey(options.networkId, accountId, keyPair);
                    console.log(`Logged in with ${accountId}`);
                } else {
                    console.log('Log in did not succeed. Please try again.')
                }
            } catch (e) {
                console.log(e)
            }
            rl.close();
        });
    }
}
