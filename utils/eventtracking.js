const SEGMENT_WRITE_KEY = 'ePJM5UVxZGUxLP9dH2wGDvUE7hC2MbTX';

const Analytics = require('analytics-node');
const chalk = require('chalk'); // colorize output
const crypto = require('crypto');
const near_cli_version = require('../package.json').version;
const settings = require('./settings');
const { askYesNoQuestion } = require('./readline');
const uuid = require('uuid');

const analytics = new Analytics(SEGMENT_WRITE_KEY);

const isGitPod = () => {
    return !!process.env.GITPOD_WORKSPACE_URL;
};

const getGitPodUserHash = () => {
    if (!process.env.GITPOD_GIT_USER_EMAIL) {
        return null;
    }
    return crypto
        .createHash('sha256')
        .update(process.env.GITPOD_GIT_USER_EMAIL, 'utf8')
        .digest('hex')
        .toString();
};

const shouldOptInByDefault = () => {
    return isGitPod();
};

const shouldTrack = (shellSettings) => {
    if (shouldOptInByDefault()) {
        return true;
    }

    return !!shellSettings.trackingEnabled;
};

const shouldTrackID = (shellSettings) => {
    return !!shellSettings.trackingAccountID;
};

const getSegmentID = (shellSettings) => isGitPod() ? getGitPodUserHash() : shellSettings.trackingSessionId;

const track = async (eventType, eventProperties, options) => {
    try {
        const shellSettings = settings.getShellSettings();
        if (!shouldTrack(shellSettings)) {
            return;
        }

        if (options.accountId && shouldTrackID(shellSettings)) {
            const accountID = options.accountId;
            const id = getSegmentID(shellSettings);
            analytics.alias({ previousId: accountID, userId: id });
        }

        const user_country = await getUserCountry();

        const segmentProperties = {
            distinct_id: getSegmentID(shellSettings),
            near_cli_version,
            user_country,
            os: process.platform,
            network_id: options.networkId === 'default' ? 'testnet' : options.networkId,
            node_url: options.nodeUrl,
            wallet_url: options.walletUrl,
            is_gitpod: isGitPod(),
            timestamp: new Date()
        };
        Object.assign(segmentProperties, eventProperties);
        analytics.track({
            userId: segmentProperties.distinct_id,
            event: eventType,
            properties: segmentProperties
        });
        analytics.identify({
            userId: segmentProperties.distinct_id,
            traits: {
                deployed_contracts: 0,
                network_id: options.networkId,
                node_url: options.nodeUrl
            }
        });
    } catch (e) {
        console.warn(
            'Warning: problem while sending developer event tracking data. This is not critical. Error: ',
            e
        );
    }
};

async function getUserCountry() {
    return fetch('https://ipinfo.io/json').then(
        (response) => response.json()
    ).then(
        (jsonResponse) => jsonResponse.country
    ).catch(error => console.log(`Failed to get the country due to: ${error}`));
}

const getEventTrackingConsent = async () => {
    return askYesNoQuestion(
        chalk`Please help us to collect data on near-cli usage to improve developer experience. ` +
        chalk`\nWe will never send private information. We collect which commands are run with attributes, your account ID, and your country` +
        chalk`\nNote that your account ID and all associated on-chain transactions are already being recorded on public blockchain. ` +
        chalk`\n\n{bold.yellow Would you like to opt in (y/n)? }`);
};

const askForConsentIfNeeded = async (options) => {
    const shellSettings = settings.getShellSettings();
    // if the appropriate option is not in settings, ask now and save settings.
    if (shellSettings.trackingEnabled === undefined || shellSettings.trackingAccountID === undefined) {
        shellSettings.trackingEnabled = shouldOptInByDefault() || (await getEventTrackingConsent());
        shellSettings.trackingAccountID = shellSettings.trackingEnabled;
        shellSettings.trackingSessionId = shellSettings.trackingEnabled ? uuid.v4() : undefined;
        settings.saveShellSettings(shellSettings);
        if (shellSettings.trackingEnabled) {
            await track(module.exports.EVENT_ID_TRACKING_OPT_IN, {}, options);
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
    EVENT_ID_DEPLOY_END: 'event_id_shell_deploy_end',
    EVENT_ID_ERROR: 'event_id_shell_error',
};
