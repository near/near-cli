
#!/bin/bash
set -e

KEY_FILE=~/.near-credentials/testnet/generate-key-test.json
rm -f "$KEY_FILE"

echo "Testing generating-key: new key"
RESULT=$(./bin/near generate-key generate-key-test --networkId testnet)
if [[ ! -f "${KEY_FILE}" ]]; then
    echo "FAILURE Key file doesn't exist"
    exit 1
fi

EXPECTED=".*Key pair:.+publicKey.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near generate-key
    exit 1
fi

echo "Testing generating-key: key for account already exists"
RESULT=$(./bin/near generate-key generate-key-test --networkId testnet)
EXPECTED=".*already has.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near generate-key when key already exists
    exit 1
fi

KEY_FILE=~/.near-credentials/testnet/credentials-test.json
rm -f "$KEY_FILE"


./bin/near add-credentials credentials-test --networkId testnet --seedPhrase "crisp clump stay mean dynamic become fashion mail bike disorder chronic sight"

if [[ ! -f "${KEY_FILE}" ]]; then
    echo "FAILURE Key file doesn't exist"
    exit 1
fi
RESULT=$(cat "${KEY_FILE}")
EXPECTED=".*ed25519:GPnL8k4MV1hLccB5rkNiihVAEEmQX3BTDJnmW1T7ZDXG.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from add-credentials
    exit 1
fi

RESULT=$(./bin/near add-credentials credentials-test --networkId testnet --secretKey "ed25519:ZYHwwLWnVU6mpcr1SPtqRtDMYxJ1uasqjDxKTqBzgpsH8Up9LVxGEFR2fJ52k7Yfd4gEkJvLayqoH9xCiPMFg6X")
EXPECTED=".*already has.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from forced add
    echo Got: $RESULT
    echo Expected: $EXPECTED
    exit 1
fi

./bin/near add-credentials credentials-test --networkId testnet --secretKey "ed25519:ZYHwwLWnVU6mpcr1SPtqRtDMYxJ1uasqjDxKTqBzgpsH8Up9LVxGEFR2fJ52k7Yfd4gEkJvLayqoH9xCiPMFg6X" --force
RESULT=$(cat "${KEY_FILE}")
EXPECTED=".*ed25519:B9WS2VmrMUNTK4LfPvNZQxHHCp4ptWPoMG6bF7MzYFZD.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from forced add
    echo Got: $RESULT
    echo Expected: $EXPECTED
    exit 1
fi