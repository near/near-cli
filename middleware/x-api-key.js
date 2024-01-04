const { getXApiKey } = require('../utils/x-api-key-settings');

module.exports = async function setNodeXApiKey(options) {
    const apiKey = getXApiKey(options.nodeUrl);
    if (apiKey) {
        options.headers = { 'x-api-key': apiKey };
    }
    return options;
};
