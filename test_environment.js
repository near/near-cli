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
        let config = require('./get-config')();
        this.global.testSettings = config;
        config = Object.assign(config, {
            contractName: "test" + Date.now(),
            accountId: "test" + Date.now()
        });
        config.deps = Object.assign(config.deps || {}, {
            storage:  this.createFakeStorage(),
            keyStore: new nearlib.InMemoryKeyStore(),
        });
        const near = await dev.connect(config);

        const keyWithRandomSeed = await nearlib.KeyPair.fromRandomSeed();
        await config.deps.createAccount(config.contractName, keyWithRandomSeed.getPublicKey());
        config.deps.keyStore.setKey(config.contractName, keyWithRandomSeed);

        // deploy contract
        const data = [...fs.readFileSync('./out/main.wasm')];
        await near.waitForTransactionResult(
            await near.deployContract(config.contractName, data));

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
