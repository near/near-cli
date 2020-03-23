/*
 * This file provides a simple path to upgrade a project's structure
 * Projects keep track of the last version of shell used, so necessary upgrades may be determined.
 */

const fs = require('fs');
const util = require('util');
const shell = require('shelljs');

const checkUpgradeNeeded = async (version) => {
    const writeFile = (filePath, data) => util.promisify(fs.writeFile)(filePath, data);
    const shellInfoFilePath = './.near/shell-info.js';

    // check for existence of shell info file and create if necessary
    if (!fs.existsSync(shellInfoFilePath)) {
        const infoJson = {
            promptToUpgrade: true,
            lastVersionUsed: version
        };
        shell.mkdir('-p', './.near');
        // write file with lint-preferred indentation
        await writeFile(shellInfoFilePath, JSON.stringify(infoJson, null, 4));
    } else {
        // shell info file existed, compare versions
        const semver = require('semver');
        const readFile = (filePath) => util.promisify(fs.readFile)(filePath, 'utf8');

        const savedInfoData = await readFile(shellInfoFilePath);
        const jsonInfoData = JSON.parse(savedInfoData);
        const lastVersionUsed = jsonInfoData.lastVersionUsed;

        if (semver.gt(version, lastVersionUsed)) {
            // run appropriate migration script
            const lastVersionObj = semver.parse(lastVersionUsed);
            const currentVersionObj = semver.parse(version);

            // if major versions differ, alert user with warning
            if (lastVersionObj.major !== currentVersionObj.major) {
                console.warn('Your near-shell version is not be backwards-compatible with the current project. Please upgrade with "npm install near-shell -g"');
                return;
            }

            // determine how many minor versions are off
            const numMinorVersionsBehind = currentVersionObj.minor - lastVersionObj.minor;
            // we add one to include the current minor as well
            for (let i = 0; i < numMinorVersionsBehind + 1; i++) {
                const minorVersion = lastVersionObj.minor + i;
                const upgradeScriptFilePath = `${__dirname}/scripts/${lastVersionObj.major}.${minorVersion}.x.js`;
                if (!fs.existsSync(upgradeScriptFilePath)) {
                    console.error(`Unable to find migration file: ${upgradeScriptFilePath}, continuing…`);
                    return;
                }

                const upgradeScriptFile = require(upgradeScriptFilePath);
                await upgradeScriptFile.upgrade(lastVersionObj.patch);
            }
        }
    }
};

exports.checkUpgradeNeeded = checkUpgradeNeeded;