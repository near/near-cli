
#!/bin/bash
set -ex
KEY_FILE=neardev/default/generate-key-test.json
rm -f "$KEY_FILE"

RESULT=$(./bin/near generate-key generate-key-test --networkId default)
echo $RESULT
 
if [[ ! -f "${KEY_FILE}" ]]; then
    echo "FAILURE Key file doesn't exist"
    exit 1
fi

EXPECTED=".*Generated key pair with ed25519:.+ public key.*"
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near generate-key
    exit 1
fi

RESULT2=$(./bin/near generate-key generate-key-test --networkId default)
echo $RESULT2

EXPECTED2=".*Account has existing key pair with ed25519:.+ public key.*"
if [[ ! "$RESULT2" =~ $EXPECTED2 ]]; then
    echo FAILURE Unexpected output from near generate-key when key already exists
    exit 1
fi