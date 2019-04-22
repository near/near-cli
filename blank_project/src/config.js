(function() {
    const CONTRACT_NAME = 'near-hello-devnet'; /* TODO: fill this in! */
    const DEFAULT_ENV = 'development';

    function getConfig(env) {
        switch (env) {
            case 'production':
            case 'development':
                return {
                    nodeUrl: 'https://studio.nearprotocol.com/devnet',
                    baseUrl: 'https://studio.nearprotocol.com/contract-api',
                    contractName: CONTRACT_NAME,
                    deps: {
                        createAccount: (accountId, publicKey) =>
                            nearlib.dev.createAccountWithContractHelper(
                                { baseUrl: 'https://studio.nearprotocol.com/contract-api' }, accountId, publicKey)
                    }
                };
            case 'local':
            case 'test':
                return {
                    deps: {
                        createAccount: nearlib.dev.createAccountWithLocalNodeConnection
                    },
                    contractName: CONTRACT_NAME
                };
            default:
                throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
        }
    }

    const cookieConfig = Cookies.getJSON('fiddleConfig');
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = getConfig;
    } else {
        window.nearConfig =  cookieConfig && cookieConfig.nearPages ? cookieConfig : getConfig(DEFAULT_ENV);
    }
})();