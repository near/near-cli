
module.exports = function getConfig() {
    const configPath = process.cwd() + '/src/config';
    try {
        const config = require(configPath)(process.env.NODE_ENV || 'development');
        return config;
    } catch (e) {
        if (e.code == 'MODULE_NOT_FOUND') {
            if(process.env.NEAR_DEBUG) console.warn(`[WARNING] Didn't find config at ${configPath}, using default shell config`);
            const defaultConfig = require('./config')(process.env.NODE_ENV || 'development');
            return defaultConfig;
        }
        throw e;
    }
};
