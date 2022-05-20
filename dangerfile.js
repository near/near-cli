const { danger, fail, warn } = require('danger');
const { includes } = require('lodash');

const hasPackageChanges = includes(danger.git.modified_files, "package.json")
const hasLockfileChanges = includes(danger.git.modified_files, "yarn.lock")
if (hasPackageChanges && !hasLockfileChanges) {
    warn("There are package.json changes with no corresponding lockfile changes")
}
