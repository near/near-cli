const MIXPANEL_TOKEN = '9aa8926fbcb03eb5d6ce787b5e8fa6eb';
var mixpanel = require('mixpanel').init(MIXPANEL_TOKEN);
const homedir = require('os').homedir();
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

const track = () => {
    const nearPath = path.join(homedir, '.near-config');
    console.log(nearPath)
    if (!fs.existsSync(nearPath)) { // TODO: make a util for .near
        //create near path if it doesn't already exist
        fs.mkdirSync(nearPath);
    }

    const shellSettingsPath = path.join(nearPath, 'shellSettings');
    if (!fs.existsSync(shellSettingsPath)) {
        //Ask if it's ok to collect feedback
        console.log("We would like to collect data on near shell usage to improve developer experience. Would you like to opt in?")
    }

    //TODO: unhardcode
    const shellSettings = {
        trackingEnabled: true,
        trackingSessionId: uuid.v4()
    };

    if (shellSettings.trackingEnabled) {
        mixpanel.track('test_event', {
            distinct_id: shellSettings.trackingSessionId,
            property_1: 'value 1',
            property_2: 'value 2',
            property_3: 'value 3'
        });
    }

   /* */
    console.log("test done")
};


track();

module.exports = { track };