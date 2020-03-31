/*
 * For each minor version, use this file as a template
 * Filenames might be:
 *  - 0.23.x
 *  - 1.19.x
 *  etc…
 *
 *  lastPatchVersion is the value found in the shell info file in .near/shell-info.js
 */

const upgrade = async (lastPatchVersion) => {
    console.log(`The user last interacted with this project with near-shell version x.x.${lastPatchVersion}`);

    /*
      if (lastPatchVersion < 1) {
        // implement essential logic that changed from x.x.0 to x.x.1
      }

      if (lastPatchVersion < 6) {
        // implement essential logic that changed from x.x.1 to x.x.6
      }
   */
};

exports.upgrade = upgrade;