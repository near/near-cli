const upgrade = async (lastPatchVersion) => {
    // logic that has changed from 0.20.1 and below
    if (lastPatchVersion < 2) {
        // check for existence of neardev/dev-account.env file, create if possible
        const fs = require('fs');
        const util = require('util');

        (async () => {
            const oldDevDeployFile = 'neardev/dev-account';
            const newDevDeployFile = 'neardev/dev-account.env';

            if (fs.existsSync(newDevDeployFile)) {
                // user already has the latest near-shell
                return;
            }

            if (fs.existsSync(oldDevDeployFile)) {
                // user has an outdated near-shell, create necessary file
                const readFile = (filePath) => util.promisify(fs.readFile)(filePath, 'utf8');
                const writeFile = (filePath, data) => util.promisify(fs.writeFile)(filePath, data);
                // read and rewrite the old file into the new format
                const fileData = await readFile(oldDevDeployFile);
                await writeFile(newDevDeployFile, `CONTRACT_NAME=${fileData}`);
            }
        })();
    }
};

exports.upgrade = upgrade;