//imports
const { ethers, run, network } = require("hardhat")
require("dotenv").config()

//async main

async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )

    console.log("Deploying...")
    const simpleStorage = await SimpleStorageFactory.deploy()
    await simpleStorage.waitForDeployment()
    console.log(`Deployed contract to: ${await simpleStorage.getAddress()}`)
    //Verfication not required for hardhat/local network

    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for 3 blocks...")

        await simpleStorage.deploymentTransaction().wait(3)
        await verify(await simpleStorage.getAddress(), [])
    }

    const currentValue = await simpleStorage.retrieve()
    console.log(`Current value is ${currentValue}`)

    //update the current value
    const transactionResponse = await simpleStorage.store(7)
    await transactionResponse.wait(1)

    const updatedValue = await simpleStorage.retrieve()
    console.log(`Updated Value: ${updatedValue}`)
}

//async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
    console.log("Verifying...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            contractAddress: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verfied!")
        } else {
            console.log(e)
        }
    }
}

//main

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
