const { assert, expect } = require("chai")
const { network, getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", function () {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
                  //enter raffle

                  console.log("Setting up test...")

                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()
                  const provider = ethers.getDefaultProvider()

                  console.log("Setting Up Listner...")

                  await new Promise(async (resolve, reject) => {
                      // setup listener before we enter the raffle
                      raffle.once("WinnerPicked", async () => {
                          console.log("Winner picked event fired!")
                          try {
                              //add asserts here
                              const recentWinner =
                                  await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance =
                                  await provider.getBalance(accounts[0].address)
                              const endingTimeStamp =
                                  await raffle.getLatestTimeStamp()

                              await expect(raffle.getPlayer(0)).to.be.reverted

                              assert.equal(
                                  recentWinner.toString(),
                                  accounts[0].address,
                              )

                              assert.equal(raffleState, 0)

                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  (
                                      winnerStartingBalance + raffleEntranceFee
                                  ).toString(),
                              )

                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                      // then entering the raffle

                      console.log("Entering Raffle...")

                      const tx = await raffle.enterRaffle({
                          value: raffleEntranceFee,
                      })
                      await tx.wait(1)

                      console.log("time to wait...")

                      const winnerStartingBalance = await provider.getBalance(
                          accounts[0].address,
                      )

                      //code won't finish until our listner has finished listening
                  })

                  //setup listner before we enter the raffle
                  //Just in case the blockchain moves really fast
              })
          })
      })
