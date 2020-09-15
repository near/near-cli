
#!/bin/bash
set -ex
KEY_FILE=~/.near-credentials/$NODE_ENV/generate-key-test.json
rm -f "$KEY_FILE"
echo "Testing generating-key: new key"

RESULT=$(./bin/near generate-key generate-key-test --networkId $NODE_ENV -v)
echo $RESULT

if [[ ! -f "${KEY_FILE}" ]]; then
    echo "FAILURE Key file doesn't exist"
    exit 1
fi

EXPECTED=".*Key pair with ed25519:.+ public key.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near generate-key
    exit 1
fi

echo "Testing generating-key: key for account already exists"

RESULT2=$(./bin/near generate-key generate-key-test --networkId $NODE_ENV -v)
echo $RESULT2

EXPECTED2=".*Account has existing key pair with ed25519:.+ public key.*"
if [[ ! "$RESULT2" =~ $EXPECTED2 ]]; then
    echo FAILURE Unexpected output from near generate-key when key already exists
    exit 1
fi
