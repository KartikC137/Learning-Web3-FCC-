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

const ethers = require("ethers")
const fs = require("fs-extra")
require("dotenv").config()

async function main() {
  // compile them in our code
  // compile them seperately

  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf8")
  // let wallet = new ethers.Wallet.fromEncryptedJsonSync(
  //   encryptedJson,
  //   process.env.PASS,
  // )
  // wallet = await wallet.connect(provider)

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8",
  )

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet)
  console.log("Please wait, deploying...")
  const contract = await contractFactory.deploy() //stop here and wait for contract to be deployed, hence await keyword
  await contract.deployTransaction.wait(1)
  console.log(`Contract Address: ${contract.address}`)

  //get number

  const currentFavouriteNumber = await contract.getNumber()
  console.log("Current Favourite Number: " + currentFavouriteNumber.toString())
  const transactionResponse = await contract.store("9")
  const transactionReceipt = await transactionResponse.wait(1)
  const updatedFavouriteNumber = await contract.getNumber()
  console.log("Updated Favourite Number: " + updatedFavouriteNumber.toString())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
