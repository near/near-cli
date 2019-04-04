const gulp = require("gulp");
const { SimpleKeyStoreSigner, InMemoryKeyStore, KeyPair, LocalNodeConnection, NearClient, Near, UnencryptedFileSystemKeyStore } = require('nearlib');
const neardev = require('nearlib/dev');
const fs = require('fs');
const yargs = require('yargs');
const ncp = require('ncp').ncp;
const rimraf = require('rimraf');
 
ncp.limit = 16;

gulp.task("build:model", async function (done) {
  const asc = require("assemblyscript/bin/asc");
  const buildModelFn = function(fileName) {
    if (fs.existsSync(yargs.argv.out_dir + "/"  + fileName)){
      asc.main([
        fileName,
        "--baseDir", yargs.argv.out_dir,
        "--nearFile", generateNearFileFullPath(fileName),
        "--measure"
      ], done);
    }
  };
  yargs.argv.model_files.forEach(buildModelFn);
});

gulp.task("build:bindings", async function (done) {
  const asc = require("assemblyscript/bin/asc");
  asc.main([
    yargs.argv.contract_file,
    "--baseDir", yargs.argv.out_dir,
    "--binaryFile", yargs.argv.out_file,
    "--nearFile", generateNearFileFullPath(yargs.argv.contract_file),
    "--measure"
  ], done);
});

gulp.task("build:all", gulp.series('build:model', 'build:bindings', function (done) {
  const asc = require("assemblyscript/bin/asc");
  asc.main([
    "../out/main.near.ts",
    "--baseDir", yargs.argv.out_dir,
    "-O3",
    "--binaryFile", yargs.argv.out_file,
    "--sourceMap",
    "--measure"
  ], done);
}));

async function ensureDir (dirPath) {
  try {
    await new Promise((resolve, reject) => {
      fs.mkdir(dirPath, { recursive: true }, err => err ? reject(err) : resolve())
    })
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

gulp.task('copyfiles', async function(done) {
  // Need to wait for the copy to finish, otherwise next tasks do not find files.
  console.log("Copying files to build directory");
  const copyDirFn = () => { 
      return new Promise(resolve => {
          ncp (yargs.argv.src_dir, yargs.argv.out_dir, response => resolve(response));
  })};
  await copyDirFn();

  // find the dependencies
  const copyFileFn = (from, to) => { 
    return new Promise(resolve => {
        ncp (from, to, response => resolve(response));
  })};
  await copyFileFn("./node_modules/near-runtime-ts/near.ts", yargs.argv.out_dir + "/near.ts");
  await ensureDir(yargs.argv.out_dir + "/json");
  await copyFileFn("./node_modules/assemblyscript-json/assembly/encoder.ts", yargs.argv.out_dir + "/json/encoder.ts");
  await copyFileFn("./node_modules/assemblyscript-json/assembly/decoder.ts", yargs.argv.out_dir + "/json/decoder.ts");
  done();
});

gulp.task('newProject', async function(done) {
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
});

gulp.task('clean', async function(done) {
  const rmDirFn = () => {
      return new Promise(resolve => {
      rimraf(yargs.argv.out_dir, response => resolve(response));
  })};
  await rmDirFn();
  console.log("Clean complete.");
  done();
});

gulp.task('build', gulp.series('clean', 'copyfiles', 'build:all'));

// Only works for dev environments
gulp.task('createDevAccount', async function(argv) {
    const keyPair = await KeyPair.fromRandomSeed();
    const accountId = argv.account_id;

    const config = readConfigFile();
    config.accountId = accountId;
    config.useDevAccount = true;
    config.deps = {
      keyStore: new InMemoryKeyStore(config.networkId),
      storage: {},
    };

    const near = await neardev.connect(config);
    await neardev.createAccountWithLocalNodeConnection(accountId, keyPair.getPublicKey());
    const keyStore = new UnencryptedFileSystemKeyStore("neardev", config.networkId);
    keyStore.setKey(accountId, keyPair);
});

async function deployContractAndWaitForTransaction(accountId, data, near) {
    const deployContractResult = await near.deployContract(accountId, data);
    const waitResult = await near.waitForTransactionResult(deployContractResult);
    return waitResult;
}

function generateNearFileFullPath(fileName) {
  return "../" + yargs.argv.out_dir + "/" + generateNearFileName(fileName);
}

// converts file.ts to file.near.ts
function generateNearFileName(fileName) {
    return fileName.replace(/.ts$/, '.near.ts');
}

function readConfigFile() {
    const file = fs.readFileSync(yargs.argv.config_file, "utf8");
    const json = JSON.parse(file);
    return json;
}

gulp.task('deploy', async function(argv) {
    const config = readConfigFile();
    config.useDevAccount = true;
    const keyStore = new UnencryptedFileSystemKeyStore("neardev", config.networkId);
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
    config.deps = {
      keyStore,
      storage: {},
    };
    config.accountId = accountId;
    const near = await neardev.connect(config);
    const contractData = [...fs.readFileSync(argv.wasm_file)];

    // Contract name
    const contractName = accountId;
    console.log(
        "Starting deployment. Account id " + accountId + ", contract " + accountId + ", url " + config.nodeUrl, ", file " + argv.wasm_file);
    const res = await deployContractAndWaitForTransaction(
        accountId, contractData, near);
    if (res.status == "Completed") {
        console.log("Deployment succeeded.");
    } else {
        console.log("Deployment transaction did not succeed: ", res);
    }
});
