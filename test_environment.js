const NodeEnvironment = require('jest-environment-node');
const nearlib = require('nearlib');
const fs = require('fs');

class LocalTestEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);
    }

    async setup() {
        this.global.nearlib = require('nearlib');
        this.global.window = {};
        let config = require('./get-config')();
        this.global.testSettings = config;
        config = Object.assign(config, {
            contractName: "test" + Date.now(),
            accountId: "test" + Date.now()
        });
        config.deps = Object.assign(config.deps || {}, {
            storage:  this.createFakeStorage(),
            keyStore: new nearlib.keyStores.InMemoryKeyStore(),
        });
        const near = await nearlib.connect(config);

        const masterAccount = near.account('test.near');
        const randomKey = await nearlib.KeyPair.fromRandom('ed25519');
        const data = [...fs.readFileSync('./out/main.wasm')];
        await masterAccount.createAndDeployContract(config.contractName, randomKey.getPublicKey(), data, 1000000); 
        config.deps.keyStore.setKey(config.networkId, config.contractName, randomKey);

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
