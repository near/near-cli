const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');


// Persistent shell settings

const getShellSettings = () => {
    const nearPath = path.join(homedir, '.near-config');
    try {
        if (!fs.existsSync(nearPath)) {
            fs.mkdirSync(nearPath);
        }
        const shellSettingsPath = path.join(nearPath, 'settings');
        if (!fs.existsSync(shellSettingsPath)) {
            return {};
        } else {
            return JSON.parse(fs.readFileSync(shellSettingsPath, 'utf8'));
        }
    } catch (e) {
        console.log(e);
    }
    return {};
};

const saveShellSettings = (settings) => {
    const nearPath = path.join(homedir, '.near-config');
    try {
        if (!fs.existsSync(nearPath)) {
            fs.mkdirSync(nearPath);
        }
        const shellSettingsPath = path.join(nearPath, 'settings');
        fs.writeFileSync(shellSettingsPath, JSON.stringify(settings));
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    getShellSettings,
    saveShellSettings
};