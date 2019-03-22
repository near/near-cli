# Greeter example in AssemblyScript

## Description

The contract implements a single function to return a greeting.

## To Run on local node
Step 1: Create account for the contract and deploy the contract.
```
npm install
near create_account --account_id id
near deploy --account_id id
```

Step 2:
modify src/settings.js line that sets the contractName. Set it to id from step 1.
```
const contractName = "contractId"; /* TODO: fill this in! */
```

Step 3:
Open src/main.html in your browser.
That's it!


## To Test

```
npm install
npm run-script build
npm test
```

## To Explore

- `assembly/main.ts` for the contract code
- `src/main.html` for the front-end HTML
- `src/main.js` for the JavaScript front-end code and how to integrate contracts
- `src/test.js` for the JS tests for the contract
