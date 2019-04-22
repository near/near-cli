// Initializing contract

// >> frontend-snippet

async function initContract() {
  // Initializing connection to the NEAR DevNet.
  window.near = await nearlib.dev.connect(nearConfig);

  // Initializing our contract APIs by contract name and configuration.
  window.contract = await near.loadContract(nearConfig.contractName, {
    // NOTE: This configuration only needed while NEAR is still in development
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ["hello"],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: [],
    // Sender is the account ID to initialize transactions.
    // For devnet we create accounts on demand. See other examples on how to authorize accounts.
    sender: nearlib.dev.myAccountId
  });
}

// Using initialized contract
async function doWork() {
  // Calling method hello on the blockchain for our contract.
  // .hello() returns a promise which we awaiting.
  const message = await contract.hello();
  // Displaying the message once we have it.
  document.getElementById('contract-message').innerText = message;
}

// COMMON CODE BELOW:
// Loads nearlib and this contract into window scope.

window.nearInitPromise = initContract()
  .then(doWork)
  .catch(console.error);

// << frontend-snippet
