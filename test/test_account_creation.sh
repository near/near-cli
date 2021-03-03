#!/bin/bash
set -x

timestamp=$(date +%s)
testaccount=testaccount$timestamp.test.near

ERROR=$(./bin/near create-account $testaccount --masterAccount test.far 2>&1 >/dev/null)
echo $ERROR
EXPECTED_ERROR=".+New account doesn't share the same top-level account.+ "
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Unexpected output creating account with different master account
    exit 1
fi

ERROR=$(./bin/near create-account tooshortfortla --masterAccount test.far 2>&1 >/dev/null)
echo $ERROR
EXPECTED_ERROR=".+Top-level accounts must be at least.+ "
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Unexpected output when creating a short top-level account
    exit 1
fi
