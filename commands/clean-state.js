const exitOnError = require("../utils/exit-on-error");
const connect = require("../utils/connect");
const nearAPI = require("near-api-js");

const os = import("os");
const path = import("path");
const fs = import("fs");

let near;
let config;
let account;

module.exports = {
    command: "clean-state <account-id>",
    desc: "Delete Contract State",
    builder: (yargs) =>
        yargs
            .option("accountId", {
                desc: "account specified for state clearing",
                type: "string",
                required: true,
            })
            .check((argv) => {
                if (!argv.accountId) {
                    throw new Error("Must provide a near account");
                }
                return true;
            }),
    handler: exitOnError(cleanState),
};

// set up near connection
const initiateNear = async () => {
    const { keyStores } = nearAPI;
    const homedir = (await os).homedir();
    const CREDENTIALS_DIR = ".near-credentials";

    const credentialsPath = (await path).join(homedir, CREDENTIALS_DIR);
    (await path).join;
    const keyStore = new keyStores.UnencryptedFileSystemKeyStore(
        credentialsPath
    );

    config = {
        networkId: "testnet",
        keyStore,
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
    };
    near = await connect(config);
};

async function cleanState(option) {
    console.log(option.accountId);
    await initiateNear();
    console.log("account name is ", option.accountId);
    account = await near.account(option.accountId);

    let state = await account.viewState("", { finality: "final" });

    state = state.map(({ key, value }) => ({
        key: key.toString("base64"),
        value: value.toString("base64"),
    }));

    let keys = state.map((el) => {
        return el.key;
    });

    console.log(keys);

    // Deploy state clearing contract onto account to clear state
    if (account) {
        // deploys contract
        const response = await account.deployContract(
            (
                await fs
            ).readFileSync("../state-clearing-contract/state_cleanup.wasm")
        );
        console.log(" deploying contract. Response:", response);

        const contract = new nearAPI.Contract(
            account, // the account object that is connecting
            "example-contract.testnet",
            {
                // name of contract you're connecting to
                viewMethods: [], // view methods do not change state but usually return a value
                changeMethods: ["clean"], // change methods modify state
                sender: account, // account object to initialize and sign transactions.
            }
        );

        return await contract.account.functionCall({
            contractId: option.accountId,
            methodName: "clean",
            args: {
                keys: keys,
            },
            gas: "300000000000000",
        });
    }
}
