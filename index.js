const { InMemoryKeyStore, KeyPair } = require('nearlib');
const neardev = require('nearlib/dev');
const UnencryptedFileSystemKeyStore = require('nearlib/signing/unencrypted_file_system_keystore');
const fs = require('fs');
const yargs = require('yargs');
const ncp = require('ncp').ncp;
const rimraf = require('rimraf');

ncp.limit = 16;

// TODO: Fix promisified wrappers to handle error properly

exports.newProject = async function() {
  // Need to wait for the copy to finish, otherwise next tasks do not find files.
  const projectDir = yargs.argv.projectDir;
  const sourceDir = __dirname + "/blank_project";
  console.log(`Copying files to new project directory (${projectDir}) from template source (${sourceDir}).`);
  const copyDirFn = () => {
      return new Promise(resolve => {
          ncp (sourceDir, yargs.argv.projectDir, response => resolve(response));
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

// Only works for dev environments
exports.createDevAccount = async function(options) {
    const keyPair = await KeyPair.fromRandomSeed();

    options.useDevAccount = true;
    options.deps = {
        keyStore: new InMemoryKeyStore(),
        storage: {},
    };

    await neardev.connect(options);
    await options.deps.createAccount(options.accountId, keyPair.getPublicKey());
    const keyStore = new UnencryptedFileSystemKeyStore();
    keyStore.setKey(options.accountId, keyPair);
    console.log("Create account complete.");
};

async function connect(options) {
    const keyStore = new UnencryptedFileSystemKeyStore();
    if (!options.accountId) {
        // see if we only have one account in keystore and just use that.
        const accountIds = await keyStore.getAccountIds();
        if (accountIds.length == 1) {
            options.accountId = accountIds[0];
        }
    }
    if (!options.accountId) {
        throw new Error('Please provide account id and make sure you created an account using `near create_account`');
    }
    options.deps = {
        keyStore,
        storage: {},
    };

    return await neardev.connect(options);
}

exports.deploy = async function(options) {
    console.log(
        `Starting deployment. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, file: ${options.wasmFile}`);
    const near = await connect(options);
    const contractData = [...fs.readFileSync(options.wasmFile)];
    const res = await near.waitForTransactionResult(
        await near.deployContract(options.accountId, contractData));
    if (res.status == "Completed") {
        console.log("Deployment succeeded.");
    } else {
        console.log("Deployment transaction did not succeed: ", res);
        process.exit(1);
    }
};

exports.scheduleFunctionCall = async function(options) {
    console.log(`Scheduling a call: ${options.contractName}.${options.methodName}(${options.args || ''})` +
        (options.amount ? ` with attached ${options.amount} NEAR` : ''));
    const near = await connect(options);
    console.log('Result:', await near.waitForTransactionResult(
        await near.scheduleFunctionCall(options.amount, options.accountId,
            options.contractName, options.methodName, JSON.parse(options.args || '{}'))));
};