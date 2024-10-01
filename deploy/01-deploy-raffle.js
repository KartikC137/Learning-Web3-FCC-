const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const VRF_SUB_FUND_AMOUNT = ethers.parseEther("30")
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2_5address, subscriptionId

    if (chainId == 31337) {
        const vrfCoordinatorV2_5Mock = await ethers.getContract(
            "VRFCoordinatorV2_5Mock",
        )
        vrfCoordinatorV2_5address = await vrfCoordinatorV2_5Mock.getAddress()
        const txResponse = await vrfCoordinatorV2_5Mock.createSubscription()
        const txReceipt = await txResponse.wait()
        subscriptionId = txReceipt.logs[0].topics[1]
        //fund subscription
        await vrfCoordinatorV2_5Mock.fundSubscription(
            subscriptionId,
            VRF_SUB_FUND_AMOUNT,
        )
    } else {
        vrfCoordinatorV2_5address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]
    const args = [
        vrfCoordinatorV2_5address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(raffle.address, args)
    }

    log("-------------------------------------")
}

module.exports.tags = ["all", "raffle"]
