#!/bin/sh
set -ex

# remove temporary blank project
rm  -rf tmp-project

# test generating new project in cwd
mkdir tmp-project
cd tmp-project
npm install -g ../
near new_project
npm install
npm remove near-shell
npm install ../
npm run test
cd ..
rm  -rf tmp-project

# test generating new project in new dir
./bin/near new_project 'tmp-project'
cd tmp-project
FILE=package.json
if test -f "$FILE"; then
  echo "$FILE exists. Have a cookie!"
else
  echo "ERROR: $FILE not found."
  exit 1
fi
