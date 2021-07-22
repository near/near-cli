const { schedule, danger } = require('danger');
const {
    checkForRelease,
    checkForNewDependencies,
    checkForLockfileDiff,
    checkForTypesInDeps
} = require('danger-plugin-yarn');

schedule(async () => {
    const packageDiff = await danger.git.JSONDiffForFile('package.json');
    checkForRelease(packageDiff);
    checkForNewDependencies(packageDiff);
    checkForLockfileDiff(packageDiff);
    checkForTypesInDeps(packageDiff);
});