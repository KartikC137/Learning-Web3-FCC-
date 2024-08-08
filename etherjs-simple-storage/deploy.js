// synchronous [solidity]
// asynchronous [JS]

//ex cooking
//1. prepare for poha
//2. add poha to the pan
//3. add poha and stir -> promise
//4. make tea and give it to everyone

// Asynchronous ex
//dont wait for poha to finish make tea

// Promise
// Pending
// Fulfilled
// Rejected

const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
  // compile them in our code
  // compile them seperately
  // http://127.0.0.1:7545
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:7545"
  );
  const wallet = new ethers.Wallet(
    "0x2166db530a380d7faa64b784ab154c46286c92019330716d41d0891c96a93032",
    provider
  );

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  );
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  console.log("Please wait, deploying...");

  const contract = await contractFactory.deploy({
    gasLimit: 6721975,
    gasPrice: 20000000000,
  }); //stop here and wait for contract to be deployed, hence await keyword
  const transactionReceipt = await contract.deployTransaction.wait(1);

  console.log("Here is the deployement transaction: (transaction response)");
  console.log(contract.deployTransaction);
  console.log("Here is the transaction receipt: ");
  console.log(transactionReceipt);

  console.log(contract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
