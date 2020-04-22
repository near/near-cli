const MIXPANEL_TOKEN = '9aa8926fbcb03eb5d6ce787b5e8fa6eb';
var mixpanel = require('mixpanel').init(MIXPANEL_TOKEN);

const uuid = require('uuid');
const chalk = require('chalk');  // colorize output
const readline = require('readline');
const settings = require('./settings');

const TRACKING_ENABLED_KEY = 'trackingEnabled';
const TRACKING_SESSION_ID_KEY = 'trackingSessionId';

const track = async (eventType, eventProperties) => {
    const shellSettings = settings.getShellSettings();
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
        settings.saveShellSettings(shellSettings);
    }

    if (!shellSettings[TRACKING_ENABLED_KEY]) {
        return;
    }

    try {
        const mixPanelProperties = {
            distinct_id: shellSettings[TRACKING_SESSION_ID_KEY]
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
    EVENT_ID_ACCOUNT_STATE_START: 'shell_account_state_start',
    EVENT_ID_ACCOUNT_STATE_SUCCESS: 'shell_account_state_success',
    EVENT_ID_DELETE_ACCOUNT_START: 'shell_delete_account_start',
    EVENT_ID_DELETE_ACCOUNT_SUCCESS: 'shell_delete_account_success',
    EVENT_ID_ACCOUNT_KEYS_START: 'shell_account_keys_start',
    EVENT_ID_ACCOUNT_KEYS_SUCCESS: 'shell_account_keys_success',
    EVENT_ID_TX_STATUS_START: 'shell_tx_status_start',
    EVENT_ID_TX_STATUS_SUCCESS: 'shell_tx_status_success',
    EVENT_ID_LOGIN: 'shell_login',
    EVENT_ID_DEPLOY: 'shell_deploy',
    EVENT_ID_DEV_DEPLOY: 'shell_dev_deploy',
    EVENT_ID_CREATE_ACCOUNT_START: 'shell_create_account_start',
    EVENT_ID_CREATE_ACCOUNT_SUCCESS: 'shell_create_account_success'
};