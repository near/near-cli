
module.exports = function getConfig() {
    const configPath = process.cwd() + '/src/config';
    try {
        const config = require(configPath)(process.env.NODE_ENV || 'development');
        console.log(config);
        return config;
    } catch (e) {
        if (e.code == 'MODULE_NOT_FOUND') {
            console.warn(`[WARNING] Didn't find config at ${configPath}\n, using default shell config`);
            const defaultConfig = require('./blank_project/src/config')(process.env.NODE_ENV || 'development');
            return defaultConfig;
        }
        throw e;
    }
}
