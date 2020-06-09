const MIXPANEL_TOKEN = '9aa8926fbcb03eb5d6ce787b5e8fa6eb';

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

const askForConsentIfNeeded = async () => {
    const shellSettings = settings.getShellSettings();
    // if the appropriate option is not in settings, ask now and save settings.
    if (!(TRACKING_ENABLED_KEY in shellSettings)) {
        shellSettings[TRACKING_ENABLED_KEY] = shouldOptInByDefault() || await getEventTrackingConsent();
        shellSettings[TRACKING_SESSION_ID_KEY] = shellSettings[TRACKING_ENABLED_KEY] ? uuid.v4() : undefined;
        settings.saveShellSettings(shellSettings);
    }
};

module.exports = {
    track,
    askForConsentIfNeeded,
    // Event ids used in mixpanel. Note that we want to mention shell to make it very easy to tell that an event came from shell,
    // since mixpanel might be used for other components as well.
    EVENT_ID_ACCOUNT_STATE_START: 'shell_account_state_start',
    EVENT_ID_ACCOUNT_STATE_END: 'shell_account_state_end',
    EVENT_ID_DELETE_ACCOUNT_START: 'shell_delete_account_start',
    EVENT_ID_DELETE_ACCOUNT_END: 'shell_delete_account_end',
    EVENT_ID_ACCOUNT_KEYS_START: 'shell_account_keys_start',
    EVENT_ID_ACCOUNT_KEYS_END: 'shell_account_keys_end',
    EVENT_ID_TX_STATUS_START: 'shell_tx_status_start',
    EVENT_ID_TX_STATUS_END: 'shell_tx_status_end',
    EVENT_ID_BUILD_START: 'shell_build_start',
    EVENT_ID_BUILD_END: 'shell_build_end',
    EVENT_ID_LOGIN_START: 'shell_login_start',
    EVENT_ID_LOGIN_END: 'shell_login_end',
    EVENT_ID_DEPLOY_START: 'shell_deploy_start',
    EVENT_ID_DEPLOY_END: 'shell_deploy_end',
    EVENT_ID_DEV_DEPLOY_START: 'shell_dev_deploy_start',
    EVENT_ID_DEV_DEPLOY_END: 'shell_dev_deploy_end',
    EVENT_ID_CALL_VIEW_FN_START: 'shell_call_view_function_start',
    EVENT_ID_CALL_VIEW_FN_END: 'shell_call_view_function_end',
    EVENT_ID_SCHEDULE_FN_CALL_START: 'shell_schedule_fn_call_start',
    EVENT_ID_SCHEDULE_FN_CALL_END: 'shell_schedule_fn_call_end',
    EVENT_ID_SEND_TOKENS_START: 'shell_send_tokens_start',
    EVENT_ID_SEND_TOKENS_END: 'shell_send_tokens_end',
    EVENT_ID_CLEAN_START: 'shell_clean_start',
    EVENT_ID_CLEAN_END: 'shell_clean_end',
    EVENT_ID_STAKE_START: 'event_id_stake_start',
    EVENT_ID_STAKE_END: 'event_id_stake_end',
    EVENT_ID_CREATE_ACCOUNT_START: 'shell_create_account_start',
    EVENT_ID_CREATE_ACCOUNT_END: 'shell_create_account_end',
    EVENT_ID_REPL_START: 'shell_repl_start', // repl is currently broken so this is not used.
    EVENT_ID_REPL_END: 'shell_repl_end',
    EVENT_ID_GENERATE_KEY_START: 'shell_generate_key_start',
    EVENT_ID_GENERATE_KEY_END: 'shell_id_generate_key_end',
    EVENT_ID_DELETE_KEY_START: 'event_id_delete_key_start',
    EVENT_ID_DELETE_KEY_END: 'event_id_delete_key_end',
    EVENT_ID_ERROR: 'event_id_shell_error'
};