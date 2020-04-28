// Note: this is a workaround to get Mixpanel to log a crash
process.on('exit', () => {
  console.log('aloha MIXPANEL_LAST_ERROR', process.env.MIXPANEL_LAST_ERROR);
  console.log('aloha last command', process.env.MIXPANEL_LAST_COMMAND);
  require('child_process').fork(__dirname + '/crash-error-report.js', [], {
    silent: true,
    env: {
      MIXPANEL_ID: process.env.MIXPANEL_ID,
      MIXPANEL_LAST_COMMAND: process.env.MIXPANEL_LAST_COMMAND,
      MIXPANEL_LAST_ERROR: process.env.MIXPANEL_LAST_ERROR
    }
  });
});

module.exports = (promiseFn) => async (...args) => {
    console.log('aloha args', args);
    process.env.MIXPANEL_LAST_COMMAND = args[0]['_'];
    const promise = promiseFn.apply(null, args);
    try {
      await promise;
    } catch (e) {
      process.env.MIXPANEL_LAST_ERROR = e.message;
      console.log('Error: ', e);
      process.exit(1);
    }
};