const { developmentChains } = require("../helper-hardhat-config.js")
const { ethers } = require("hardhat")
const BASE_FEE = ethers.parseEther("0.25") // 0.25 Link per request is Premium fee.
const GAS_PRICE_LINK = 1e9 //calculated value based on the gas price of the chain
const WEI_PER_UNIT_LINK = 4609050109111871
// Chainlink Nodes pay the gas fees to give us randomness & do external execution
// So they pay the price of requests change based on the price of gas

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK, WEI_PER_UNIT_LINK]

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying")
        //deploy a mock VRFCoordinator

        await deploy("VRFCoordinatorV2_5Mock", {
            from: deployer,
            log: true,
            args: args,
        })

        log("Mocks Deployed")
        log("----------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
