
module.exports = function getConfig() {
    const configPath = process.cwd() + '/src/config.js';
    try {
        return require(configPath)(process.env.NODE_ENV || 'development');
    } catch (e) {
        console.log(`[WARNING] Didn't find config at ${configPath}\n`);
        return {};
    }
}