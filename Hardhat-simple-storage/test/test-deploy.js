const { ethers } = require("hardhat")
const { expect, assert } = require("chai")

describe("SimpleStorage", function () {
    //a function to delay execution
    function delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    let SimpleStorageFactory, simpleStorage
    beforeEach(async function () {
        //test function
        SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
        simpleStorage = await SimpleStorageFactory.deploy()
    })

    //To run only specific test(s) : yarn hardhat test --grep keyword

    it("Should start with a favourite number as 0", async function () {
        const currentValue = await simpleStorage.retrieve()
        const expectedValue = "0"
        //assert or expect can be used

        await delay(500) //wait for coinmarketapi
        assert.equal(currentValue.toString(), expectedValue)
        //asserting current value to be expected value

        //expect(currentValue.toString()).to.equal(expectedValue)
    })

    it("Should update when we call store", async function () {
        const expectedValue = "69"
        const transactionResponse = await simpleStorage.store(expectedValue)

        await transactionResponse.wait(1)
        const currentValue = await simpleStorage.retrieve()

        await delay(500)
        assert.equal(currentValue.toString(), expectedValue)
    })

    it("First Person(index 0) is default", async function () {
        const defaultPerson = await simpleStorage.addPerson("default", 0)
        const index = 0
        await defaultPerson.wait(1)
        const currentValue = await simpleStorage.getPersonName(index)
        const expectedValue = "default"

        assert.equal(currentValue.toString(), expectedValue)
    })
})
