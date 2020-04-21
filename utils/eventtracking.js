const MIXPANEL_TOKEN = '9aa8926fbcb03eb5d6ce787b5e8fa6eb';
var mixpanel = require('mixpanel').init(MIXPANEL_TOKEN);
const homedir = require('os').homedir();
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const chalk = require('chalk');  // colorize output
const readline = require('readline');

const TRACKING_ENABLED_KEY = 'trackingEnaled';
const TRACKING_SESSION_ID_KEY = 'trackingSessionId';

// TODO: pull out into separate file. Remove DBG console printouts
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


const track = async (eventType, eventProperties) => {
    const shellSettings = getShellSettings();
    // if the appropriate option is not in settings, ask now and save settings.
    if (!(TRACKING_ENABLED_KEY in shellSettings)) {
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
       
        shellSettings[TRACKING_ENABLED_KEY] = await getEventTrackingConsent();
        shellSettings[TRACKING_SESSION_ID_KEY] = shellSettings[TRACKING_ENABLED_KEY] ? uuid.v4() : undefined;
        rl.close();
        saveShellSettings(shellSettings);
    }

    if (!shellSettings[TRACKING_ENABLED_KEY]) {
        return;
    }

    try {
        const mixPanelProperties = {
            distinct_id: shellSettings.trackingSessionId
        };
        Object.assign(mixPanelProperties, eventProperties);
        mixpanel.track(eventType, mixPanelProperties);
    }
    catch (e) {
        console.log('Warning: problem while sending developer event tracking data. This is not critical. Error: ', e);
    }
};

module.exports = {
    track,

    // Event ids used in mixpanel. Note that we want to mention shell to make it very easy to tell that an event came from shell,
    // since mixpanel might be used for other components as well.
    EVENT_ID_ACCOUNT_STATE: 'shell_account_state',
    EVENT_ID_LOGIN: 'shell_login',
    EVENT_ID_DEPLOY: 'shell_deploy',
    EVENT_ID_DEV_DEPLOY: 'shell_dev_deploy'
};