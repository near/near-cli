const fs = require('fs');

async function loadAbi(abiPath) {
    return JSON.parse(fs.readFileSync(abiPath)).abi;
}

module.exports = async function parseAbi(options) {
    if (options.abi) {
        options.abi = await loadAbi(options.abi);
    }
};