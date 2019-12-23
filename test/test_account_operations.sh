#!/bin/bash
set -ex
rm  -rf tmp-project
yarn create near-app --vanilla tmp-project
cd tmp-project
timestamp=$(date +%s)
testaccount=testaccount$timestamp
echo Create account
../bin/near create_account $testaccount

echo Get account state
RESULT=$(../bin/near state $testaccount | strip-ansi)
echo $RESULT
EXPECTED=".+Account $testaccount.+amount:.+'10'.+ "
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view
    exit 1
fi

../bin/near delete_account $testaccount test.near
