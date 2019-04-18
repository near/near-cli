#!/bin/sh
set -ex
rm  -rf tmp-project
mkdir tmp-project
cd tmp-project
../bin/near new_project
npm install
npm uninstall near-shell
npm install ../
npm run build
npm run test-on-devnet
