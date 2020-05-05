const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');


// Persistent shell settings
const SETTINGS_FILE_NAME = 'settings.json';
const SETTINGS_DIR = '.near-config';

const getShellSettings = () => {
    const nearPath = path.join(homedir, SETTINGS_DIR);
    try {
        if (!fs.existsSync(nearPath)) {
            fs.mkdirSync(nearPath);
        }
        const shellSettingsPath = path.join(nearPath, SETTINGS_FILE_NAME);
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
    const nearPath = path.join(homedir, SETTINGS_DIR);
    try {
        if (!fs.existsSync(nearPath)) {
            fs.mkdirSync(nearPath);
        }
        const shellSettingsPath = path.join(nearPath, SETTINGS_FILE_NAME);
        const indentationSize = 4;
        fs.writeFileSync(shellSettingsPath, JSON.stringify(settings, null, indentationSize));
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    getShellSettings,
    saveShellSettings
};