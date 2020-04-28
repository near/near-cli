const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');

const MIXPANEL_TOKEN = '9aa8926fbcb03eb5d6ce787b5e8fa6eb';
const mixpanel = require('mixpanel').init(MIXPANEL_TOKEN);

const SETTINGS_DIR = '.near-config';
const SETTINGS_FILE_NAME = 'settings.json';

const TRACKING_ENABLED_KEY = 'trackingEnabled';

// console.log('aloha plz', process.argv[2]);
// console.log(process.env.FOO);

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

const shellSettings = getShellSettings();

if (!shellSettings[TRACKING_ENABLED_KEY]) {
  return;
}

// User has opted-in to crash analytics

try {
  const mixPanelProperties = {
    distinct_id: process.env.MIXPANEL_ID,
    near_shell_command: process.env.MIXPANEL_LAST_COMMAND,
    error_message: process.env.MIXPANEL_LAST_ERROR
  };
  Object.assign(mixPanelProperties, {});
  mixpanel.track('error', mixPanelProperties);
} catch (e) {
  console.log('Warning: problem while sending developer event tracking data. This is not critical. Error: ', e);
}
