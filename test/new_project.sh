#!/bin/sh
set -ex

RED='\033[0;31m'
GREEN='\033[0;32m'

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
FILE=package.json
if test -f "$FILE"; then
  echo "${GREEN}$FILE exists. Have a cookie!"
else
  echo "${RED}ERROR: file not found."
fi