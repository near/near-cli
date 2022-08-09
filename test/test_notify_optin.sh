#!/bin/bash
set -e

timestamp=$(date +%s)
testaccount=testaccount$timestamp$RANDOM.test.near

echo Creating account
./bin/near create-account $testaccount > /dev/null

echo Deploying contract to temporary accountId
TEXT=$(./bin/near dev-deploy ./test/res/guest_book.wasm)
EXPECTED='You may chose to opt in by running near track'
if [[ ! "$TEXT" =~ .*"$EXPECTED".* ]]; then
    echo FAILURE Unexpected output from near call: "$TEXT"
    exit 1
fi

echo Invalid tracking parameter
TEXT=$(./bin/near track bleh)
EXPECTED='Invalid choice of'
if [[ ! "$TEXT" =~ .*"$EXPECTED".* ]]; then
    echo FAILURE Unexpected output from near call: "$TEXT"
    exit 1
fi

echo Activate tracking
TEXT=$(./bin/near track yes)
EXPECTED='Data tracking enabled'
if [[ ! "$TEXT" =~ .*"$EXPECTED".* ]]; then
    echo FAILURE Unexpected output from near call: "$TEXT"
    exit 1
fi

echo Disable tracking
TEXT=$(./bin/near track no)
EXPECTED='Data tracking disabled'
if [[ ! "$TEXT" =~ .*"$EXPECTED".* ]]; then
    echo FAILURE Unexpected output from near call: "$TEXT"
    exit 1
fi
