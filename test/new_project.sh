#!/bin/sh
set -ex
# remove temporary blank project
rm  -rf test/tmp-project
cd test/
# test generating new project in cwd
mkdir tmp-project
cd tmp-project
../../bin/near new_project
npm install
npm uninstall near-shell
npm install ../../
NODE_ENV=development npm run test
cd ..
rm  -rf tmp-project
# test generating new project in new dir
../bin/near new_project 'tmp-project'
cd tmp-project
npm install
npm uninstall near-shell
npm install ../../
NODE_ENV=development npm run test