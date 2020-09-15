const { decode } = require('bs58');

module.exports = (publicKey) => {
    return decode(publicKey.replace('ed25519:', '')).toString('hex');
};
