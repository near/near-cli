#!/bin/sh
set -ex
cd tmp-project
rm  -rf assembly
mkdir assembly
timestamp=$(date +%s)
testaccount=testaccount$timestamp
../bin/near create_account $testaccount
echo Building contract
cp ../node_modules/near-runtime-ts/tests/assembly/*.ts assembly/
yarn
yarn build
echo Deploying contract
../bin/near deploy --accountId=$testaccount --wasmFile=out/main.wasm
echo Calling functions
RESULT=$(../bin/near call $testaccount hello "{}" --accountId=test.near)
if [[ $RESULT != *"Result: helloa"* ]]; then
    echo FAILURE Unexpected output from near call
    exit 1
fi
