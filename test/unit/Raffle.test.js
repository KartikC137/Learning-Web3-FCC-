const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", async function () {
          let raffle, vrfCoordinatorV2_5Mock
          const chainId = network.config.chainId

          beforeEach(async function () {
              const { deployer } = await getNamedAccounts()
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2_5Mock = await ethers.getContract(
                  "VRFCoordinatorV2_5Mock",
                  deployer,
              )
          })

          describe("constructor", async function () {
              it("intializes the raffle correctly", async function () {
                  // Ideally we make out tests have just 1 assert per "it"

                  const raffleState = await raffle.getRaffleState()
                  const interval = await raffle.getInterval()
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(
                      interval.toString(),
                      networkConfig[chainId]["interval"],
                  )
              })
          })

          describe("enterRaffle", async function () {
              it("reverts when you don't pay enough", async function () {
                  await expect(raffle)
              })
          })
      })
