#!/bin/sh
set -ex
rm  -rf tmp-project
mkdir tmp-project
cd tmp-project
../bin/near new_project
npm install
npm uninstall near-shell
npm install ../
NODE_ENV=development npm run test


