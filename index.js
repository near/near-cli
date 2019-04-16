const { InMemoryKeyStore, KeyPair } = require('nearlib');
const neardev = require('nearlib/dev');
const UnencryptedFileSystemKeyStore = require('./unencrypted_file_system_keystore');
const fs = require('fs');
const yargs = require('yargs');
const ncp = require('ncp').ncp;
const rimraf = require('rimraf');

ncp.limit = 16;

// TODO: Fix promisified wrappers to handle error properly

exports.newProject = async function() {
  // Need to wait for the copy to finish, otherwise next tasks do not find files.
  const proj_dir = yargs.argv.project_dir;
  const source_dir = __dirname + "/blank_project";
  console.log(`Copying files to new project directory (${proj_dir}) from template source (${source_dir}).`);
  const copyDirFn = () => {
      return new Promise(resolve => {
          ncp (source_dir, yargs.argv.project_dir, response => resolve(response));
  })};
  await copyDirFn();
  console.log('Copying project files complete.')
};

exports.clean = async function() {
  const rmDirFn = () => {
      return new Promise(resolve => {
      rimraf(yargs.argv.out_dir, response => resolve(response));
  })};
  await rmDirFn();
  console.log("Clean complete.");
};

// Only works for dev environments
exports.createDevAccount = async function(argv) {
    const keyPair = await KeyPair.fromRandomSeed();
    const accountId = argv.account_id;
    const nodeUrl = argv.node_url;

    const options = {
        nodeUrl,
        accountId,
        useDevAccount: true,
        deps: {
            keyStore: new InMemoryKeyStore(),
            storage: {},
        }
    };

    await neardev.connect(options);
    await neardev.createAccountWithLocalNodeConnection(accountId, keyPair.getPublicKey());
    const keyStore = new UnencryptedFileSystemKeyStore();
    keyStore.setKey(accountId, keyPair);
};

async function deployContractAndWaitForTransaction(accountId, data, near) {
    const deployContractResult = await near.deployContract(accountId, data);
    const waitResult = await near.waitForTransactionResult(deployContractResult);
    return waitResult;
}

exports.deploy = async function(argv) {
    const keyStore = new UnencryptedFileSystemKeyStore();
    let accountId = argv.account_id;
    if (!accountId) {
        // see if we only have one account in keystore and just use that.
        const accountIds = await keyStore.getAccountIds();
        if (accountIds.length == 1) {
            accountId = accountIds[0];
        }
    }
    if (!accountId) {
        throw 'Please provide account id and make sure you created an account using near create_account';
    }
    const nodeUrl = argv.node_url;
    const options = {
        nodeUrl,
        accountId,
        deps: {
          keyStore,
          storage: {},
        }
    };

    const near = await neardev.connect(options);
    const contractData = [...fs.readFileSync(argv.wasm_file)];

    console.log(
        "Starting deployment. Account id " + accountId + ", contract " + accountId + ", url " + nodeUrl, ", file " + argv.wasm_file);
    const res = await deployContractAndWaitForTransaction(
        accountId, contractData, near);
    if (res.status == "Completed") {
        console.log("Deployment succeeded.");
    } else {
        console.log("Deployment transaction did not succeed: ", res);
        process.exit(1);
    }
};
