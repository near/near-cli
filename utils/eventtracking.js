const MIXPANEL_TOKEN = '9aa8926fbcb03eb5d6ce787b5e8fa6eb';
var mixpanel = require('mixpanel').init(MIXPANEL_TOKEN);
const homedir = require('os').homedir();
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');
const uuid = require('uuid');
const chalk = require('chalk');  // colorize output
const readline = require('readline');

// TODO: pull out into separate file. Remove DBG console printouts
const getShellSettings = () => {
    const nearPath = path.join(homedir, '.near-config');
    try {
        if (!fs.existsSync(nearPath)) {
            fs.mkdirSync(nearPath);
        }
        const shellSettingsPath = path.join(nearPath, 'shellSettings');
        if (!fs.existsSync(shellSettingsPath)) {
            return {};
        } else {
            return JSON.parse(fs.readFileSync(shellSettingsPath, 'utf8'));
        }
    } catch (e) {
        console.log(e);
    }
    return {};
}

const saveShellSettings = (settings) => {
    const nearPath = path.join(homedir, '.near-config');
    try {
        if (!fs.existsSync(nearPath)) {
            fs.mkdirSync(nearPath);
        }
        const shellSettingsPath = path.join(nearPath, 'shellSettings');
        fs.writeFileSync(shellSettingsPath, JSON.stringify(settings));
    } catch (e) {
        console.log(e);
    }
}


const track = async (eventType, eventProperties) => {
    const shellSettings = getShellSettings();
    // if the appropriate option is not in settings, ask now and save settings.
    if (!('trackingEnabled' in shellSettings)) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const getEventTrackingConsent = async () => {
            for (var attempts = 0; attempts < 10; attempts++) {
                const answer = await new Promise((resolve) => {
               
                    rl.question(
                        chalk`We would like to collect data on near shell usage to improve developer experience. {bold.yellow Would you like to opt in (y/n)?}`,
                        async (consentToEventTracking) => {
                            if (consentToEventTracking == 'y' || consentToEventTracking == 'Y') { 
                                resolve(true); 
                            }
                            else if (consentToEventTracking == 'n' || consentToEventTracking == 'N') {
                                resolve(false);
                            }
                            resolve(undefined);
                        });
                });
                if (answer !== undefined) {
                    return answer;
                }
            }
            return false; // If they can't figure it out in this many attempts, just opt out
        };
       
        shellSettings['trackingEnabled'] = await getEventTrackingConsent();
        shellSettings['trackingSessionId'] = shellSettings['trackingEnabled'] ? uuid.v4() : undefined;
        rl.close();
        saveShellSettings(shellSettings);
    }

    if (!shellSettings.trackingEnabled) {
        return;
    }

    if (shellSettings.trackingEnabled) {
        const mixPanelProperties = {
            distinct_id: shellSettings.trackingSessionId
        };
        Object.assign(mixPanelProperties, eventProperties);
        mixpanel.track(eventType, mixPanelProperties);
    }
};

module.exports = { track };