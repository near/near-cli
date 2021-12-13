const { saveShellSettings, getShellSettings } = require('./settings');

function setXApiKey(rpcServerUrl, xApiKey) {
    if (!rpcServerUrl || !xApiKey) {
        throw new Error('Empty value provided');
    }
    let shellSettings = getShellSettings();
    if (!shellSettings.rpcServerApiKeys) {
        shellSettings.rpcServerApiKeys = {};
    }
    shellSettings.rpcServerApiKeys[rpcServerUrl] = xApiKey;
    saveShellSettings(shellSettings);
}

function getXApiKey(rpcServerUrl) {
    if (!rpcServerUrl) {
        throw new Error('Empty value provided');
    }
    const rpcServerApiKeys = getShellSettings().rpcServerApiKeys;
    return rpcServerApiKeys ? rpcServerApiKeys[rpcServerUrl] : undefined;
}

module.exports = {
    getXApiKey,
    setXApiKey,
};
