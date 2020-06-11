const MIXPANEL_TOKEN = 'e98aa9d6d259d9d78f20cb05cb54f5cb';

const chalk = require('chalk');  // colorize output
const crypto = require('crypto');
const mixpanel = require('mixpanel').init(MIXPANEL_TOKEN);
const near_cli_version = require('../package.json').version;
const readline = require('readline');
const settings = require('./settings');
const uuid = require('uuid');

const TRACKING_ENABLED_KEY = 'trackingEnabled';
const TRACKING_SESSION_ID_KEY = 'trackingSessionId';

const isGitPod = () => {
    return !!process.env.GITPOD_WORKSPACE_URL;
};

const getGitPodUserHash = () => {
    if (!process.env.GITPOD_GIT_USER_EMAIL) {
        return null;
    }
    return crypto.createHash('sha256').update(process.env.GITPOD_GIT_USER_EMAIL, 'utf8').digest('hex').toString();
};

const shouldOptInByDefault = () => {
    return isGitPod();
};

const shouldTrack = (shellSettings) => {
    if (shouldOptInByDefault()) {
        return true;
    }
    return TRACKING_ENABLED_KEY in shellSettings && shellSettings[TRACKING_ENABLED_KEY];
};

const track = async (eventType, eventProperties, options) => {
    const shellSettings = settings.getShellSettings();
    if (!shouldTrack(shellSettings)) {
        return;
    }
    try {
        const mixPanelProperties = {
            distinct_id: isGitPod() ? getGitPodUserHash() : shellSettings[TRACKING_SESSION_ID_KEY],
            near_cli_version,
            os: process.platform,
            network_id: options.networkId,
            node_url: options.nodeUrl,
            wallet_url: options.walletUrl,
            is_gitpod: isGitPod()
        };
        Object.assign(mixPanelProperties, eventProperties);
        await mixpanel.track(eventType, mixPanelProperties);
    } catch (e) {
        console.log('Warning: problem while sending developer event tracking data. This is not critical. Error: ', e);
    }
};

const getEventTrackingConsent = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    try {
        for (let attempts = 0; attempts < 10; attempts++) {
            const answer = await new Promise((resolve) => {
                rl.question(
                    chalk`We would like to collect data on near-shell usage to improve developer experience.` +
                    chalk` We will never send private information. We only collect which commands are run via an anonymous identifier.` +
                    chalk`{bold.yellow  Would you like to opt in (y/n)? }`,
                    async (consentToEventTracking) => {
                        if (consentToEventTracking == 'y' || consentToEventTracking == 'Y') {
                            resolve(true);
                        } else if (consentToEventTracking == 'n' || consentToEventTracking == 'N') {
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
    } finally {
        rl.close();
    }
};

const askForConsentIfNeeded = async (options) => {
    const shellSettings = settings.getShellSettings();
    // if the appropriate option is not in settings, ask now and save settings.
    if (!(TRACKING_ENABLED_KEY in shellSettings)) {
        shellSettings[TRACKING_ENABLED_KEY] = shouldOptInByDefault() || await getEventTrackingConsent();
        shellSettings[TRACKING_SESSION_ID_KEY] = shellSettings[TRACKING_ENABLED_KEY] ? uuid.v4() : undefined;
        settings.saveShellSettings(shellSettings);
        if (shellSettings[TRACKING_ENABLED_KEY]) {
            track(module.exports.EVENT_ID_TRACKING_OPT_IN, {}, options);
        }
    }
};

module.exports = {
    track,
    askForConsentIfNeeded,
    // Some of the event ids are auto-generated runtime with the naming convention event_id_shell_{command}_start

    EVENT_ID_CREATE_ACCOUNT_END: 'event_id_shell_create-account_end',
    EVENT_ID_TRACKING_OPT_IN: 'event_id_tracking_opt_in',
    EVENT_ID_LOGIN_END: 'event_id_shell_login_end',
    EVENT_ID_ERROR: 'event_id_shell_error'
};