(function() {
    const CONTRACT_NAME = 'near-hello-devnet'; /* TODO: fill this in! */
    const DEFAULT_ENV = 'development';

    function getConfig(env) {
        switch (env) {
            case 'production':
            case 'development':
                return {
                    networkId: 'default',
                    nodeUrl: 'http://34.94.13.241:3030',
                    contractName: CONTRACT_NAME,
                    walletUrl: 'https://wallet.nearprotocol.com',
                };
            case 'local':
                return {
                    networkId: 'local',
                    nodeUrl: 'http://localhost:3030',
                    keyPath: '~/.near/validator_key.json',
                    contractName: CONTRACT_NAME
                };
            case 'test':
                return {
                    networkId: 'local',
                    nodeUrl: 'http://localhost:3030',
                    contractName: CONTRACT_NAME,
                    masterAccount: 'test.near',
                }
            default:
                throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
        }
    }

    const cookieConfig = typeof Cookies != 'undefined' && Cookies.getJSON('fiddleConfig');
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = getConfig;
    } else {
        window.nearConfig =  cookieConfig && cookieConfig.nearPages ? cookieConfig : getConfig(DEFAULT_ENV);
    }
})();