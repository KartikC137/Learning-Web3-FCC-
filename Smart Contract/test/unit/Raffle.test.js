const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle,
              vrfCoordinatorV2_5Mock,
              raffleEntranceFee,
              deployer,
              interval
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2_5Mock = await ethers.getContract(
                  "VRFCoordinatorV2_5Mock",
                  deployer,
              )
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          describe("constructor", function () {
              it("intializes the raffle correctly", async function () {
                  // Ideally we make out tests have just 1 assert per "it"
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(
                      interval.toString(),
                      networkConfig[chainId]["interval"],
                  )
              })
          })

          describe("enterRaffle", function () {
              it("reverts when you don't pay enough", async function () {
                  await expect(
                      raffle.enterRaffle(),
                  ).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle__NotEnoughETHEntered",
                  )
              })
              it("records players when they enter", async function () {
                  //raffle Entrance Fee
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, deployer)
              })

              it("emits event on enter", async function () {
                  await expect(
                      raffle.enterRaffle({ value: raffleEntranceFee }),
                  ).to.emit(raffle, "RaffleEnter")
              })
              //   it("doesn't allow entrance when raffle is calculating", async function () {
              //       console.log("value of interval is:" + Number(interval))
              //       await raffle.enterRaffle({ value: raffleEntranceFee })
              //       await network.provider.send("evm_increaseTime", [
              //           Number(interval) + 1,
              //       ])
              //       await network.provider.send("evm_mine", [])

              //       // Pretend to be a Chainklink Keeper

              //       await raffle.performUpkeep("0x")
              //       await expect(
              //           raffle.enterRaffle({ value: raffleEntranceFee }),
              //       ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen")
              //   })
          })

          //describe("checkUpKeep", function () {
          //   it("returns false if people haven't sent any ETH", async function () {
          //       await network.provider.send("evm_increaseTime", [
          //           interval.toNumber() + 1,
          //       ])
          //       await network.provider.send("evm_mine", [])
          //       const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
          //           [],
          //       )
          //       assert(!upkeepNeeded)
          //   })
          //   it("returns false if raffle is not open", async function () {
          //       await raffle.enterRaffle({ value: raffleEntranceFee })
          //       await network.provider.send("evm_increaseTime", [
          //           interval.toNumber() + 1,
          //       ])
          //       await network.provider.send("evm_mine", [])
          //       await raffle.performUpkeep([])
          //       const raffleState = await raffle.getRaffleState()
          //       const { upkeepNeeded } = await raffle.callStatic.checkUpKeep(
          //           [],
          //       )
          //       assert.equal(raffleState.toString(), "1")
          //       assert.equal(upkeepNeeded, false)
          //   })
          //   it("returns false if enough time hasn't passed", async () => {
          //       await raffle.enterRaffle({ value: raffleEntranceFee })
          //       await network.provider.send("evm_increaseTime", [
          //           interval.toNumber() - 5,
          //       ]) // use a higher number here if this test fails
          //       await network.provider.request({
          //           method: "evm_mine",
          //           params: [],
          //       })
          //       const { upkeepNeeded } =
          //           await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
          //       assert(!upkeepNeeded)
          //   })
          //   it("returns true if enough time has passed, has players, eth, and is open", async () => {
          //       await raffle.enterRaffle({ value: raffleEntranceFee })
          //       await network.provider.send("evm_increaseTime", [
          //           interval.toNumber() + 1,
          //       ])
          //       await network.provider.request({
          //           method: "evm_mine",
          //           params: [],
          //       })
          //       const { upkeepNeeded } =
          //           await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
          //       assert(upkeepNeeded)
          //   })
          //})

          //   describe("performUpkeep", function () {
          //       it("can only run if checkupkeep is true", async () => {
          //           await raffle.enterRaffle({ value: raffleEntranceFee })
          //           await network.provider.send("evm_increaseTime", [
          //               interval.toNumber() + 1,
          //           ])
          //           await network.provider.request({
          //               method: "evm_mine",
          //               params: [],
          //           })
          //           const tx = await raffle.performUpkeep("0x")
          //           assert(tx)
          //       })
          //       it("reverts if checkup is false", async () => {
          //           await expect(raffle.performUpkeep("0x")).to.be.revertedWith(
          //               "Raffle__UpkeepNotNeeded",
          //           )
          //       })
          //       it("updates the raffle state and emits a requestId", async () => {
          //           // Too many asserts in this test!
          //           await raffle.enterRaffle({ value: raffleEntranceFee })
          //           await network.provider.send("evm_increaseTime", [
          //               interval.toNumber() + 1,
          //           ])
          //           await network.provider.request({
          //               method: "evm_mine",
          //               params: [],
          //           })
          //           const txResponse = await raffle.performUpkeep("0x") // emits requestId
          //           const txReceipt = await txResponse.wait(1) // waits 1 block
          //           const raffleState = await raffle.getRaffleState() // updates state
          //           const requestId = txReceipt.events[1].args.requestId
          //           assert(requestId.toNumber() > 0)
          //           assert(raffleState == 1) // 0 = open, 1 = calculating
          //       })
          //})

          //   describe("fulfillRandomWords", function () {
          //       beforeEach(async function () {
          //           await raffle.enterRaffle({ value: raffleEntranceFee })
          //           await network.provider.send("evm_increaseTime", [
          //               interval.toNumber() + 1,
          //           ])
          //           await network.provider.request({
          //               method: "evm_mine",
          //               params: [],
          //           })
          //       })
          //       it("can only be called after performupkeep", async () => {
          //           await expect(
          //               vrfCoordinatorV2_5Mock.fulfillRandomWords(
          //                   0,
          //                   raffle.address,
          //               ), // reverts if not fulfilled
          //           ).to.be.revertedWith("nonexistent request")
          //           await expect(
          //               vrfCoordinatorV2_5Mock.fulfillRandomWords(
          //                   1,
          //                   raffle.address,
          //               ), // reverts if not fulfilled
          //           ).to.be.revertedWith("nonexistent request")
          //       })
          //       // A bigAss test.
          //       // This test simulates users entering the raffle and wraps the entire functionality of the raffle
          //       // inside a promise that will resolve if everything is successful.
          //       // An event listener for the WinnerPicked is set up
          //       // Mocks of chainlink keepers and vrf coordinator are used to kickoff this winnerPicked event
          //       // All the assertions are done once the WinnerPicked event is fired

          //       it("picks a winner, resets, and sends money", async function () {
          //           const additionalEntrants = 3
          //           const startingAccountIndex = 1 // deployer is 0th
          //           const accounts = await ethers.getSigners()
          //           for (
          //               let i = startingAccountIndex;
          //               i < startingAccountIndex + additionalEntrants;
          //               i++
          //           ) {
          //               const accountConnectedRaffle = raffle.connect(accounts[i])
          //               await accountConnectedRaffle.enterRaffle({
          //                   value: raffleEntranceFee,
          //               })
          //               const startingTimeStamp = await raffle.getLastTimeStamp()

          //               // performUpkeep (mock being chainlink keepers)
          //               // fulfillRandomWords (mock being chainlink VRF)
          //               // we will have to wait for the fullfillRandomWords to be called

          //               await new Promise(async (resolve, reject) => {
          //                   raffle.once("WinnerPicked", async () => {
          //                       console.log("WinnerPicked event fired!")
          //                       // assert throws an error if it fails, so we need to wrap
          //                       // it in a try/catch so that the promise returns event
          //                       // if it fails.
          //                       try {
          //                           const recentWinner  = await raffle.getRecentWinner()
          //                           console.log(recentWinner)
          //                           console.log(accounts[2].address)                                  console.log(accounts[0])
          //                           console.log(accounts[0].address)
          //                           console.log(accounts[1].address)
          //                           console.log(accounts[3].address)

          //                           const recentWinner =
          //                               await raffle.getRecentWinner()
          //                           const raffleState =
          //                               await raffle.getRaffleState()
          //                           const endingTimeStamp =
          //                               await raffle.getLatestTimeStamp()
          //                           const numPlayers =
          //                               await raffle.getNumberOfPlayers()
          //                           const winnerEndingBalance = await accounts[1].getBalance
          //                           assert.equal(numPlayers.toString(), "0")
          //                           assert.equal(raffleState.toString(), "0")
          //                           assert(endingTimeStamp > startingTimeStamp)
          //                           assert.equal(winnerEndingBalance.toString(),
          //                                winnerStartingBalance.add(
          //                                raffleEntraceFee.mul(additionalEntrants)
          //                                .add(raffleEntranceFee)
          //                                .toString()
          //                                )
          //                            )
          //                       } catch (e) {
          //                           reject(e)
          //                       }
          //                       resolve()
          //                   })
          //                   //setting up the listner
          //                   //below, we will fire the event, and the listner will pick it up, and resolve
          //                   const tx = await raffle.performUpkeep([])
          //                   const txReceipt = await tx.wait(1)
          //                   const winnerStartingBalance = await accounts[1].getBalance
          //                   await vrfCoordinatorV2_5Mock.fulfillRandomWords(
          //                       txReceipt.events[1].args.requestId,
          //                       raffle.address,
          //                   )
          //               })
          //           }
          //       })
          //   })
      })
