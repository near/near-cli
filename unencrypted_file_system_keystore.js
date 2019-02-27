const fs = require('fs');
const keyDir = './neardev';
const keyFile = 'devkey.json';
const KeyPair = require('nearlib/signing/key_pair')
const {promisify} = require('util');

/**
 * Unencrypted file system key store.
 */
class UnencryptedFileSystemKeyStore {
    constructor() {}

    async setKey(accountId, keypair) {
        if (!await promisify(fs.exists)(keyDir)){
            await promisify(fs.mkdir)(keyDir);
        }
        const keyFileContent = {
            public_key: keypair.getPublicKey(),
            secret_key: keypair.getSecretKey(),
            account_id: accountId
        };
        await promisify(fs.writeFile)(this.getKeyFilePath(), JSON.stringify(keyFileContent));
    }

    async getKey(accountId) {
        // Find keys/account id
        if (!await promisify(fs.exists)(this.getKeyFilePath())) {
            throw 'Key lookup failed. Please make sure you set up an account.';
        }
        const rawKey = await this.getRawKey();
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
        if (!await promisify(fs.exists)(this.getKeyFilePath())) {
            return [];
        }
        const rawKey = await this.getRawKey();
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

    async getRawKey() {
        return JSON.parse(await promisify(fs.readFile)(this.getKeyFilePath()));
    }
}

module.exports = UnencryptedFileSystemKeyStore;