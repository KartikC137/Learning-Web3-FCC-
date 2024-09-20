const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoodinatorV2address

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2_5Mock = await ethers.getContract(
            "VRFCoordinatorV2_5Mock",
        )
        vrfCoodinatorV2address = vrfCoordinatorV2_5Mock.address
        subscription = vrfCoordinatorV2_5Mock.createSubscription
        subId = await subscription.wait(1)
        fundSubscription = vrfCoodinatorV2_Mock.fundSubscription
        //creating subcription in progress
    } else {
        vrfCoodinatorV2address = networkConfig[chainId]["vrfCoordinatorV2"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const args = [vrfCoodinatorV2address, entranceFee, gasLane]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
}
