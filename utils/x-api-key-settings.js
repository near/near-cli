const { saveShellSettings, getShellSettings } = require('./settings');

function setXApiKey(rpcServerUrl, xApiKey) {
    if (!rpcServerUrl || !xApiKey) {
        throw new Error(
            `Empty value provided. RPC Server URL: ${rpcServerUrl}, X-API-Key: ${xApiKey}`
        );
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
        throw new Error(`Empty value provided. RPC Server URL: ${rpcServerUrl}`);
    }
    const rpcServerApiKeys = getShellSettings().rpcServerApiKeys;
    return rpcServerApiKeys ? rpcServerApiKeys[rpcServerUrl] : undefined;
}

module.exports = {
    getXApiKey,
    setXApiKey,
};
