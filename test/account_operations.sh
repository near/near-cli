#!/bin/sh
set -ex
cd tmp-project
timestamp=$(date +%s)
testaccount=testaccount$timestamp
echo Create account
../bin/near create_account $testaccount

echo Get account state
RESULT=$(../bin/near state $testaccount)
if [[ $RESULT != *"Account $testaccount"*"amount: '100000000'"* ]]; then
    echo FAILURE Unexpected output from near state
    exit 1
fi
