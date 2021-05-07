#!/bin/bash
timestamp=$(date +%s)
testaccount=testaccount$timestamp.test.near

ERROR=$(./bin/near create-account $testaccount --masterAccount test.far 2>&1 >/dev/null)
EXPECTED_ERROR=".+New account doesn't share the same top-level account.+ "
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Unexpected output creating account with different master account
    exit 1
fi

ERROR=$(./bin/near create-account tooshortfortla --masterAccount test.far 2>&1 >/dev/null)
EXPECTED_ERROR=".+Top-level accounts must be at least.+ "
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Unexpected output when creating a short top-level account
    exit 1
fi

echo Create account with seed phrase
./bin/near create-account $testaccount --publicKey="Au4RC7YHfZuhxK8DnXDrizCSEXXc9mc9teVm4Nbtv6Tj" > /dev/null
RESULT=$(./bin/near create-account create-me.$testaccount --masterAccount=$testaccount --seedPhrase="cross teach omit obvious riot echo parrot member memory wide obscure ball" --initialBalance=1 -v | ./node_modules/.bin/strip-ansi)
EXPECTED=".+Account create-me.$testaccount for network .+ was created.+"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE \"Create account with seed phrase\" Unexpected output from create-account
    exit 1
fi

./bin/near delete $testaccount test.near > /dev/null
