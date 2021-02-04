const MIXPANEL_TOKEN = 'e98aa9d6d259d9d78f20cb05cb54f5cb';

const chalk = require('chalk'); // colorize output
const crypto = require('crypto');
const mixpanel = require('mixpanel').init(MIXPANEL_TOKEN);
const near_cli_version = require('../package.json').version;
const settings = require('./settings');
const { askYesNoQuestion } = require('./readline');
const uuid = require('uuid');

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

const shouldNotTrackID = (shellSettings) => {
    return  shellSettings.trackingAccountID !== undefined && !shellSettings.trackingAccountID;
};

const track = async (eventType, eventProperties, options) => {
    const shellSettings = settings.getShellSettings();
    if (!shouldTrack(shellSettings)) {
        return;
    }
    try {
        const mixPanelProperties = {
            distinct_id: isGitPod()
                ? getGitPodUserHash()
                : shellSettings.trackingSessionId,
            near_cli_version,
            os: process.platform,
            network_id: options.networkId === 'default' ? 'testnet': options.networkId,
            node_url: options.nodeUrl,
            wallet_url: options.walletUrl,
            is_gitpod: isGitPod(),
            timestamp: new Date()
        };
        Object.assign(mixPanelProperties, eventProperties);
        await Promise.all([mixpanel.track(eventType, mixPanelProperties),
            mixpanel.people.set(mixPanelProperties.distinct_id, {
                deployed_contracts: 0,
                network_id: options.networkId,
                node_url: options.nodeUrl,
            })]);
    } catch (e) {
        console.log(
            'Warning: problem while sending developer event tracking data. This is not critical. Error: ',
            e
        );
    }
};

const getEventTrackingConsent = async () => {
    return askYesNoQuestion(
        chalk`We would like to collect data on near-cli usage to improve developer experience. ` +
        chalk` We will never send private information. We only collect which commands are run with attributes. ` +
        chalk`{bold.yellow  Would you like to opt in (y/n)? }`);
};

const getIdTrackingConsent = async () => {
    return askYesNoQuestion(
        chalk`We would like to help with your development journey with NEAR. ` +
        chalk`We will ask you to share your account ID while using command. ` +
        chalk`Note that your account ID and all associated on-chain transactions are already being recorded on public blockchain. ` +
        chalk`{bold.yellow  Would you like to share the account Id (y/n)? }`);
};

const askForId = async (options, masterAccount) => {
    const shellSettings = settings.getShellSettings();
    const accountID = masterAccount ? masterAccount : options.accountId;
    if(shouldTrackID(shellSettings)){
        const id = isGitPod() ? getGitPodUserHash() : shellSettings.trackingSessionId;
        await Promise.all([
            mixpanel.alias(accountID, id),
            mixpanel.people.set(id, {account_id: accountID})
        ]);
    } else if(shouldNotTrackID(shellSettings)){
        return;
    } else{
        shellSettings.trackingAccountID = (await getIdTrackingConsent());
        settings.saveShellSettings(shellSettings);
    }
};

const askForConsentIfNeeded = async (options, masterAccount) => {
    const shellSettings = settings.getShellSettings();
    // if the appropriate option is not in settings, ask now and save settings.
    if (shellSettings.trackingEnabled === undefined) {
        shellSettings.trackingEnabled = shouldOptInByDefault() || (await getEventTrackingConsent());
        shellSettings.trackingSessionId = shellSettings.trackingEnabled ? uuid.v4() : undefined;
        settings.saveShellSettings(shellSettings);
        if (shellSettings.trackingEnabled) {
            await track(module.exports.EVENT_ID_TRACKING_OPT_IN, {}, options);
        }
    }
    await askForId(options, masterAccount);
};

const trackDeployedContract = async () => {
    const shellSettings = settings.getShellSettings();
    const id = isGitPod() ? getGitPodUserHash() : shellSettings.trackingSessionId;
    await mixpanel.people.increment(id, 'deployed_contracts');
};

module.exports = {
    track,
    askForConsentIfNeeded,
    trackDeployedContract,
    // Some of the event ids are auto-generated runtime with the naming convention event_id_shell_{command}_start

    EVENT_ID_CREATE_ACCOUNT_END: 'event_id_shell_create-account_end',
    EVENT_ID_TRACKING_OPT_IN: 'event_id_tracking_opt_in',
    EVENT_ID_LOGIN_END: 'event_id_shell_login_end',
    EVENT_ID_DEPLOY_END: 'event_id_shell_deploy_end',
    EVENT_ID_ERROR: 'event_id_shell_error',
};
