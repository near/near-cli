const NodeEnvironment = require('jest-environment-node');
const dev = require('nearlib/dev');
const fs = require('fs');
const nearlib = require('nearlib');


class LocalTestEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);
    }

    async setup() {
        this.global.nearlib = require('nearlib');
        this.global.nearlib.dev = require('nearlib/dev');
        this.global.window = {};
        this.global.testSettings = {
            contractName: "test" + Date.now(),
            accountId: "test" + Date.now(),
            nodeUrl: "http://localhost:3030",
            deps: {
                storage:  this.createFakeStorage(),
                keyStore: new nearlib.InMemoryKeyStore(),
                createAccount: dev.createAccountWithLocalNodeConnection
            }
        };
        const near = await dev.connect(this.global.testSettings);

        const keyWithRandomSeed = await nearlib.KeyPair.fromRandomSeed();
        await dev.createAccountWithLocalNodeConnection(this.global.testSettings.contractName, keyWithRandomSeed.getPublicKey());
        this.global.testSettings.deps.keyStore.setKey(this.global.testSettings.contractName, keyWithRandomSeed);

        // deploy contract
        const data = [...fs.readFileSync('./out/main.wasm')];
        await near.waitForTransactionResult(
            await near.deployContract(this.global.testSettings.contractName, data));

        await super.setup();
    }

    async teardown() {
        await super.teardown();
    }

    runScript(script) {
        return super.runScript(script);
    }

    createFakeStorage() {
        let store = {};
        return {
            getItem: function(key) {
                return store[key];
            },
            setItem: function(key, value) {
                store[key] = value.toString();
            },
            clear: function() {
                store = {};
            },
            removeItem: function(key) {
                delete store[key];
            }
        };
    };
}

module.exports = LocalTestEnvironment
