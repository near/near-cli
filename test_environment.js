const NodeEnvironment = require('jest-environment-node');
const nearlib = require('nearlib');
const fs = require('fs');

const INITIAL_BALANCE = '100000000000';
const testAccountName = 'test.near';

class LocalTestEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);
    }

    async setup() {
        this.global.nearlib = require('nearlib');
        this.global.window = {};
        let config = require('./get-config')();
        this.global.testSettings = this.global.nearConfig = config;
        config = Object.assign(config, {
            contractName: 'test' + Date.now(),
            accountId: 'test' + Date.now()
        });
        const keyStore = new nearlib.keyStores.UnencryptedFileSystemKeyStore('./neardev');
        config.deps = Object.assign(config.deps || {}, {
            storage:  this.createFakeStorage(),
            keyStore,
        });
        const near = await nearlib.connect(config);

        const masterAccount = await near.account(testAccountName);
        const randomKey = await nearlib.KeyPair.fromRandom('ed25519');
        const data = [...fs.readFileSync('./out/main.wasm')];
        await config.deps.keyStore.setKey(config.networkId, config.contractName, randomKey);
        await masterAccount.createAndDeployContract(config.contractName, randomKey.getPublicKey(), data, INITIAL_BALANCE);

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
    }
}

module.exports = LocalTestEnvironment;
