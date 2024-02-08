#!/bin/bash
set -e

timestamp=$(date +%s)
testaccount1=testaccount${timestamp}-1.testnet
testaccount2=testaccount${timestamp}-2.testnet
testaccount3=testaccount${timestamp}-3.testnet
testaccount4=testaccount${timestamp}-4.testnet
zerobalance=testaccount${timestamp}-z.testnet
withbalance=testaccount${timestamp}-y.testnet

tla=${timestamp}${timestamp}${timestamp}12

# Can create a pre-funded account
./bin/near create-account $testaccount1 --useFaucet

# Can create an account with a given public key & balance
./bin/near create-account sub.$testaccount1 --accountId $testaccount1 --publicKey "78MziB9aTNsu19MHHVrfWy762S5mAqXgCB6Vgvrv9uGV"  --initialBalance 0.01

RESULT=$(./bin/near list-keys sub.$testaccount1)
EXPECTED=".*78MziB9aTNsu19MHHVrfWy762S5mAqXgCB6Vgvrv9uGV.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near list-keys
    echo Got: $RESULT
    echo Expected: $EXPECTED
    exit 1
fi

RESULT=$(./bin/near state sub.$testaccount1)
EXPECTED=".*formattedAmount: '0.01'.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view
    echo Got: $RESULT
    echo Expected: $EXPECTED
    exit 1
fi

# An account can fund other accounts
./bin/near create-account $testaccount2 --accountId $testaccount1

# An account can create zero-balance accounts
./bin/near create-account $zerobalance --accountId $testaccount1 --initialBalance 0

set +e

# Cannot create sub-accounts of other accounts
ERROR=$(./bin/near create-account sub.$testaccount2 --accountId $testaccount1 2>&1)
EXPECTED_ERROR=".*can't be created by.*"
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE - Unexpected output creating a sub-account of another account
    echo Got: $ERROR
    echo Expected: $EXPECTED_ERROR
    exit 1
fi

# Cannot use a non-existing account to fund another
ERROR=$(./bin/near create-account $testaccount3 --accountId test.far 2>&1)
EXPECTED_ERROR=".+do not have the credentials locally.+"
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE - Unexpected output creating account with an unexisting master account
    echo Got: $ERROR
    echo Expected: $EXPECTED_ERROR
    exit 1
fi

# Cannot create a TLA with a short name
ERROR=$(./bin/near create-account tooshortfortla --accountId $testaccount1 2>&1)
EXPECTED_ERROR=".+cannot create Top Level Accounts.+"
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Unexpected output when creating a short top-level account
    echo Got: $ERROR
    echo Expected: $EXPECTED_ERROR
    exit 1
fi

# Cannot create a TLA with a long name
ERROR=$(./bin/near create-account $tla --accountId $testaccount1 2>&1)
EXPECTED_ERROR=".+cannot create Top Level Accounts.+"
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Unexpected output when creating a long top-level account
    echo Got: $ERROR
    echo Expected: $EXPECTED_ERROR
    exit 1
fi

# Cannot create a useFaucet account in mainnet
ERROR=$(./bin/near create-account $testaccount4 --useFaucet --networkId mainnet 2>&1)
EXPECTED_ERROR=".+Pre-funding accounts is only possible on testnet.+"
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Unexpected output when funding pre-funded account in mainnet
    echo Got: $ERROR
    echo Expected: $EXPECTED_ERROR
    exit 1
fi

# Proper error message when account does not have enough balance
ERROR=$(./bin/near create-account $testaccount4 --accountId $zerobalance --initialBalance 0.1 2>&1)
EXPECTED_ERROR=".+does not have enough balance.+"
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Unexpected output when creating a short top-level account
    echo Got: $ERROR
    echo Expected: $EXPECTED_ERROR
    exit 1
fi

./bin/near delete $testaccount1 influencer.testnet --force
./bin/near delete $testaccount2 influencer.testnet --force
