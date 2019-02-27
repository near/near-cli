const fs = require('fs');
const keyDir = './neardev';
const keyFile = 'devkey.json';
const KeyPair = require('nearlib/signing/key_pair')

/**
 * Unencrypted file system key store.
 */
class UnencryptedFileSystemKeyStore {
    constructor() {}

    async setKey(accountId, keypair) {
        if (!fs.existsSync(keyDir)){
            fs.mkdirSync(keyDir);
        }
        const keyFileContent = {
            public_key: keypair.getPublicKey(),
            secret_key: keypair.getSecretKey(),
            account_id: accountId
        };
        const writeResult = await fs.writeFileSync(this.getKeyFilePath(), JSON.stringify(keyFileContent));
    }

    async getKey(accountId) {
        // Find keys/account id
        if (!fs.existsSync(this.getKeyFilePath())) {
            throw 'Key lookup failed. Please make sure you set up an account.';
        }
        const rawKey = JSON.parse(fs.readFileSync(this.getKeyFilePath()));
        if (!rawKey.public_key || !rawKey.secret_key || !rawKey.account_id) {
            throw 'Deployment failed. neardev/devkey.json format problem. Please make sure file contains public_key, secret_key, and account_id".';
        }
        if (rawKey.account_id != accountId) {
            throw 'Deployment failed. Keystore contains data for wrong account.';
        }
        const result = new KeyPair(rawKey.public_key, rawKey.secret_key);
        return result;
    }

    /**
     * Returns all account ids.
     */
    async getAccountIds() {
        if (!fs.existsSync(this.getKeyFilePath())) {
            return [];
        }
        const rawKey = JSON.parse(fs.readFileSync(this.getKeyFilePath()));
        if (!rawKey.public_key || !rawKey.secret_key || !rawKey.account_id) {
            return [];
        }
        return [rawKey.account_id];
    }

    async clear() {
        this.keys = {};
    }

    // TODO: make this configurable
    getKeyFilePath() {
        return keyDir + "/" + keyFile;
    }
}

module.exports = UnencryptedFileSystemKeyStore;